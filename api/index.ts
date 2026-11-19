import express from 'express';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const app = express();

app.use(express.json({ limit: '25mb' }));

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const ASTROLABE_SYSTEM_PROMPT = `You are Astrolabe AI, a highly intelligent, accurate, articulate, and helpful AI assistant on par with Claude, ChatGPT, and Gemini.
You give direct, accurate, well-structured, and deeply helpful answers to every user question—whether it is factual Q&A, math, coding, debugging, creative writing, translation, research, business strategy, or everyday help.

Core Principles:
- Always answer the user's exact question directly and accurately first. Never respond with generic filler or evade a simple factual question.
- Match the user's language naturally and fluently:
  - When addressed in Bengali (বাংলা), reply in natural, fluent, accurate Bengali.
  - When addressed in English or any other language, reply in that language fluently.
- Format responses cleanly using Markdown (headings, bullet points, numbered lists, bold highlights, tables, and fenced code blocks with language tags).

Interactive Artifacts System:
When the user asks you to build a complete interactive web app, game, UI component, dashboard, standalone HTML page, SVG graphic, or Mermaid diagram, wrap the complete executable artifact in XML tags:
<astrolabeArtifact id="unique-id" type="application/vnd.astrolabe.code" language="html" title="Artifact Title">
...complete standalone code...
</astrolabeArtifact>

Allowed artifact types & languages:
- type="application/vnd.astrolabe.code" with language="html" | "jsx" | "javascript" | "python" | "typescript" | "css"
- type="image/svg+xml" with language="svg"
- type="text/markdown" with language="markdown"
- type="application/vnd.astrolabe.diagram" with language="mermaid"

For standalone HTML artifacts, include complete HTML5 with embedded <style> and <script> (or Tailwind CDN) so it runs immediately in the live preview pane. Do NOT wrap trivial short code snippets in <astrolabeArtifact>; use standard markdown code fences for normal coding questions.

Thinking Process:
When extended thinking is enabled or the question involves complex reasoning, math proofs, or multi-step debugging, you may briefly structure your reasoning inside <astrolabeThinking>...</astrolabeThinking> tags before your final answer.`;

function resolveModelAndThinking(selectedModel: string, enableThinking: boolean) {
  if (selectedModel === 'astrolabe-3-haiku' && !enableThinking) {
    return {
      geminiModel: 'gemini-3.1-flash-lite',
      thinkingLevel: ThinkingLevel.MINIMAL,
    };
  }

  const useDeepThinking = enableThinking || selectedModel === 'astrolabe-thinking';
  return {
    geminiModel: 'gemini-4-hydrogen',
    thinkingLevel: useDeepThinking ? ThinkingLevel.HIGH : ThinkingLevel.LOW,
  };
}

function buildGeminiContents(messages: Array<{ role: string; content: string; attachments?: any[] }>) {
  const recentMessages = messages.length > 20 ? messages.slice(-20) : messages;

  const rawContents = recentMessages.map((msg) => {
    const parts: any[] = [];

    if (msg.attachments && Array.isArray(msg.attachments)) {
      for (const att of msg.attachments) {
        if (att.mimeType && att.base64) {
          parts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: att.base64.replace(/^data:[^;]+;base64,/, ''),
            },
          });
        } else if (att.text) {
          parts.push({
            text: `[Attached File: ${att.name || 'document'}]\n${att.text}\n`,
          });
        }
      }
    }

    if (msg.content && msg.content.trim()) {
      parts.push({ text: msg.content.trim() });
    }

    return {
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts,
    };
  });

  let contents = rawContents.filter((c) => c.parts.length > 0);
  while (contents.length > 0 && contents[0].role === 'model') {
    contents = contents.slice(1);
  }
  return contents;
}

function isTransientOrCapacityError(err: any): boolean {
  const status = err?.status || err?.code;
  const msg = String(err?.message || err || '').toLowerCase();
  return (
    status === 429 ||
    status === 500 ||
    status === 503 ||
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('resource_exhausted') ||
    msg.includes('timeout')
  );
}

interface ModelAttempt {
  model: string;
  thinkingLevel: ThinkingLevel;
  useTools: boolean;
  delayBeforeMs?: number;
}

function buildModelAttemptPlan(
  primaryModel: string,
  primaryThinking: ThinkingLevel,
  useSearch: boolean
): ModelAttempt[] {
  const secondaryModel =
    primaryModel === 'gemini-3.1-flash-lite' ? 'gemini-4-hydrogen' : 'gemini-3.1-flash-lite';
  const secondaryThinking =
    secondaryModel === 'gemini-3.1-flash-lite' ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW;

  const attempts: ModelAttempt[] = [
    { model: primaryModel, thinkingLevel: primaryThinking, useTools: useSearch },
  ];

  if (useSearch) {
    attempts.push({
      model: primaryModel,
      thinkingLevel: primaryThinking,
      useTools: false,
      delayBeforeMs: 100,
    });
  }

  // Immediate failover to alternate Gemini capacity pool on 503 / high demand / 429 / slow stall
  attempts.push({
    model: secondaryModel,
    thinkingLevel: secondaryThinking,
    useTools: false,
    delayBeforeMs: 50,
  });

  // Final quick retry on secondary pool if both spiked transiently
  attempts.push({
    model: secondaryModel,
    thinkingLevel: secondaryThinking,
    useTools: false,
    delayBeforeMs: 400,
  });

  return attempts;
}

async function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          const err: any = new Error(message);
          err.status = 503;
          reject(err);
        }, ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function extractCleanApiErrorMessage(error: any): string {
  const raw = String(error?.message || error || 'Unknown error');
  try {
    const parsed = JSON.parse(raw);
    const inner = parsed?.error?.message || parsed?.message;
    if (typeof inner === 'string') {
      try {
        const deep = JSON.parse(inner);
        return deep?.error?.message || deep?.message || inner;
      } catch {
        return inner;
      }
    }
  } catch {
    // not JSON
  }
  return raw;
}

function formatReadableError(error: any): string {
  const rawMessage = String(error?.message || error || 'Unknown error');
  const cleanMessage = extractCleanApiErrorMessage(error);
  const lower = `${rawMessage} ${cleanMessage}`.toLowerCase();

  if (rawMessage.includes('GEMINI_API_KEY is not configured')) {
    return 'Server AI configuration is missing (GEMINI_API_KEY). Please set GEMINI_API_KEY in AI Studio Secrets or Vercel Environment Variables and retry.';
  }
  if (
    lower.includes('permission_denied') ||
    lower.includes('api_key_invalid') ||
    lower.includes('api key not valid') ||
    error?.status === 403 ||
    error?.status === 400
  ) {
    return 'API key validation failed. Please verify your GEMINI_API_KEY in Settings > Secrets or Vercel Environment Variables.';
  }
  if (
    lower.includes('high demand') ||
    lower.includes('unavailable') ||
    error?.status === 503 ||
    lower.includes('"code":503') ||
    lower.includes('"code": 503')
  ) {
    return 'AI সার্ভারে এই মুহূর্তে সাময়িক অতিরিক্ত চাপ রয়েছে। অনুগ্রহ করে কয়েক সেকেন্ড পর Retry বাটনে ক্লিক করুন।';
  }
  if (lower.includes('resource_exhausted') || error?.status === 429) {
    return 'সাময়িকভাবে অনুরোধের সীমা (Rate Limit) পূর্ণ হয়েছে। কয়েক সেকেন্ড অপেক্ষা করে আবার Retry করুন।';
  }
  return `অনুরোধ সম্পন্ন করা যায়নি: ${cleanMessage}`;
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    model: 'gemini-4-hydrogen',
    fallbackModel: 'gemini-3.1-flash-lite',
    brand: 'Astrolabe AI',
    configured: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
  });
});

// Prompt enhancement endpoint
app.post('/api/enhance-prompt', async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = createGeminiClient();
    const plan = buildModelAttemptPlan('gemini-4-hydrogen', ThinkingLevel.LOW, false);
    let lastError: any;

    for (let idx = 0; idx < plan.length; idx++) {
      const attempt = plan[idx];
      const hasMoreFallbacks = idx < plan.length - 1;
      try {
        if (attempt.delayBeforeMs) {
          await new Promise((r) => setTimeout(r, attempt.delayBeforeMs));
        }
        const genPromise = ai.models.generateContent({
          model: attempt.model,
          contents: `You are an expert AI prompt engineer. Improve and clarify the following prompt so an AI gives the most accurate, comprehensive answer while preserving the user's intent and language (Bengali if input is Bengali, English if English). Return ONLY the improved prompt text with no quotes or preamble.\n\nPrompt: "${prompt}"`,
          config: {
            thinkingConfig: { thinkingLevel: attempt.thinkingLevel },
          },
        });
        const response = hasMoreFallbacks
          ? await withTimeout(genPromise, 5500, 'Primary model timed out')
          : await genPromise;
        const enhancedPrompt = response.text?.trim() || prompt;
        return res.json({ enhancedPrompt });
      } catch (err: any) {
        lastError = err;
        if (!isTransientOrCapacityError(err)) throw err;
      }
    }

    throw lastError;
  } catch (error: any) {
    console.error('Enhance prompt error:', error);
    res.status(500).json({ error: formatReadableError(error) });
  }
});

// Streaming chat endpoint (SSE) with automatic multi-model capacity failover
app.post('/api/chat/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  try {
    const {
      messages,
      model = 'astrolabe-3.5-sonnet',
      systemInstruction,
      responseStyle = 'default',
      enableThinking = false,
      useSearch = false,
    } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.write(`data: ${JSON.stringify({ error: 'Messages array is required.' })}\n\n`);
      return res.end();
    }

    const contents = buildGeminiContents(messages);
    if (contents.length === 0) {
      res.write(`data: ${JSON.stringify({ error: 'Please enter a message or attach a file.' })}\n\n`);
      return res.end();
    }

    const ai = createGeminiClient();

    let styleInstruction = '';
    if (responseStyle === 'concise') {
      styleInstruction = '\nResponse Style: Be brief, direct, and concise with minimal preamble.';
    } else if (responseStyle === 'explanatory') {
      styleInstruction = '\nResponse Style: Provide thorough, educational step-by-step explanations with examples.';
    } else if (responseStyle === 'formal') {
      styleInstruction = '\nResponse Style: Use an academic, professional, and formal tone.';
    } else if (responseStyle === 'creative') {
      styleInstruction = '\nResponse Style: Use imaginative, expressive, and evocative prose.';
    }

    const thinkingGuidance =
      enableThinking || model === 'astrolabe-thinking'
        ? '\nBefore answering complex questions, output brief structured reasoning inside <astrolabeThinking>...</astrolabeThinking> tags.'
        : '';

    const fullSystemInstruction = [
      ASTROLABE_SYSTEM_PROMPT,
      styleInstruction,
      thinkingGuidance,
      systemInstruction ? `\nUser & Project Instructions:\n${systemInstruction}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const { geminiModel, thinkingLevel } = resolveModelAndThinking(model, Boolean(enableThinking));

    res.write(`data: ${JSON.stringify({ connected: true, status: 'generating' })}\n\n`);
    if ((res as any).flush) (res as any).flush();

    heartbeatTimer = setInterval(() => {
      if (!res.writableEnded) {
        res.write(': keep-alive\n\n');
        if ((res as any).flush) (res as any).flush();
      }
    }, 3000);

    const plan = buildModelAttemptPlan(geminiModel, thinkingLevel, Boolean(useSearch));
    const collectedSources = new Map<string, { title: string; uri: string }>();
    let hasYieldedText = false;
    let lastError: any = null;

    const emitChunk = (chunk: any) => {
      const text = chunk?.text;
      if (text) {
        hasYieldedText = true;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
        if ((res as any).flush) (res as any).flush();
      }
      const groundingChunks = chunk?.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (Array.isArray(groundingChunks)) {
        for (const gc of groundingChunks) {
          if (gc?.web?.uri) {
            collectedSources.set(gc.web.uri, {
              title: gc.web.title || gc.web.uri,
              uri: gc.web.uri,
            });
          }
        }
      }
    };

    for (let idx = 0; idx < plan.length; idx++) {
      if (hasYieldedText) break;
      const attempt = plan[idx];
      const hasMoreFallbacks = idx < plan.length - 1;

      try {
        if (attempt.delayBeforeMs) {
          await new Promise((r) => setTimeout(r, attempt.delayBeforeMs));
        }

        const config: any = {
          systemInstruction: fullSystemInstruction,
          thinkingConfig: { thinkingLevel: attempt.thinkingLevel },
        };
        if (attempt.useTools) {
          config.tools = [{ googleSearch: {} }];
        }

        const streamPromise = ai.models.generateContentStream({
          model: attempt.model,
          contents,
          config,
        });

        const stream = hasMoreFallbacks
          ? await withTimeout(streamPromise, 5500, 'Primary model connection timed out')
          : await streamPromise;

        const iterator = stream[Symbol.asyncIterator]();
        const firstStep = hasMoreFallbacks
          ? await withTimeout(iterator.next(), 5500, 'Primary model first chunk timed out')
          : await iterator.next();

        if (!firstStep.done && firstStep.value) {
          emitChunk(firstStep.value);
        }

        if (!firstStep.done) {
          while (true) {
            const step = await iterator.next();
            if (step.done) break;
            if (step.value) emitChunk(step.value);
          }
        }

        if (hasYieldedText) {
          break;
        }
      } catch (attemptErr: any) {
        lastError = attemptErr;
        console.warn(
          `Astrolabe stream attempt failed (${attempt.model}, tools=${attempt.useTools}):`,
          extractCleanApiErrorMessage(attemptErr)
        );
        if (hasYieldedText) {
          break;
        }
        if (!attempt.useTools && !isTransientOrCapacityError(attemptErr)) {
          throw attemptErr;
        }
      }
    }

    if (!hasYieldedText && lastError) {
      throw lastError;
    }

    if (collectedSources.size > 0) {
      res.write(`data: ${JSON.stringify({ sources: Array.from(collectedSources.values()) })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Astrolabe /api/chat/stream error:', error);
    const errorMessage = formatReadableError(error);
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.end();
    }
  } finally {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
  }
});

// Non-streaming chat endpoint with automatic multi-model capacity failover
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages,
      model = 'astrolabe-3.5-sonnet',
      systemInstruction,
      responseStyle = 'default',
      enableThinking = false,
      useSearch = false,
    } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const contents = buildGeminiContents(messages);
    if (contents.length === 0) {
      return res.status(400).json({ error: 'Non-empty message content is required' });
    }

    const ai = createGeminiClient();
    const { geminiModel, thinkingLevel } = resolveModelAndThinking(model, Boolean(enableThinking));

    let styleInstruction = '';
    if (responseStyle === 'concise') styleInstruction = '\nResponse Style: Brief and direct.';
    else if (responseStyle === 'explanatory') styleInstruction = '\nResponse Style: In-depth educational.';
    else if (responseStyle === 'formal') styleInstruction = '\nResponse Style: Academic and formal.';
    else if (responseStyle === 'creative') styleInstruction = '\nResponse Style: Imaginative and evocative.';

    const fullSystemInstruction = [
      ASTROLABE_SYSTEM_PROMPT,
      styleInstruction,
      systemInstruction ? `\nUser & Project Instructions:\n${systemInstruction}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const plan = buildModelAttemptPlan(geminiModel, thinkingLevel, Boolean(useSearch));
    let lastError: any = null;

    for (let idx = 0; idx < plan.length; idx++) {
      const attempt = plan[idx];
      const hasMoreFallbacks = idx < plan.length - 1;
      try {
        if (attempt.delayBeforeMs) {
          await new Promise((r) => setTimeout(r, attempt.delayBeforeMs));
        }
        const config: any = {
          systemInstruction: fullSystemInstruction,
          thinkingConfig: { thinkingLevel: attempt.thinkingLevel },
        };
        if (attempt.useTools) {
          config.tools = [{ googleSearch: {} }];
        }

        const genPromise = ai.models.generateContent({
          model: attempt.model,
          contents,
          config,
        });

        const response = hasMoreFallbacks
          ? await withTimeout(genPromise, 5500, 'Primary model timed out')
          : await genPromise;

        return res.json({ text: response.text || '' });
      } catch (attemptErr: any) {
        lastError = attemptErr;
        if (!attempt.useTools && !isTransientOrCapacityError(attemptErr)) {
          throw attemptErr;
        }
      }
    }

    throw lastError;
  } catch (error: any) {
    console.error('Astrolabe /api/chat error:', error);
    res.status(500).json({ error: formatReadableError(error) });
  }
});

// Express JSON error guard so unhandled middleware errors always return structured JSON
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled API error:', err);
  if (!res.headersSent) {
    res.status(err?.status || 500).json({
      error: err?.message || 'Internal server error',
    });
  }
});

export { app };
export default app;
