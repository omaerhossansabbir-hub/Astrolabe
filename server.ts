import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
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

async function withExponentialBackoff<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.code;
      const msg = String(err?.message || '').toLowerCase();
      const isTransient =
        status === 429 ||
        status === 500 ||
        status === 503 ||
        msg.includes('resource_exhausted') ||
        msg.includes('unavailable') ||
        msg.includes('timeout');

      if (!isTransient || attempt === maxRetries) {
        throw err;
      }
      const delayMs = 600 * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

function formatReadableError(error: any): string {
  const rawMessage = String(error?.message || error || 'Unknown error');
  if (rawMessage.includes('GEMINI_API_KEY is not configured')) {
    return 'Server AI configuration is missing (GEMINI_API_KEY). Please set the API key in Settings > Secrets and retry.';
  }
  if (rawMessage.includes('PERMISSION_DENIED') || rawMessage.includes('API_KEY_INVALID') || error?.status === 403 || error?.status === 400) {
    return 'API key validation failed. Please verify GEMINI_API_KEY in Settings > Secrets.';
  }
  if (rawMessage.includes('RESOURCE_EXHAUSTED') || error?.status === 429) {
    return 'Rate limit reached momentarily. Please wait a few seconds and click Retry.';
  }
  return `Unable to complete request: ${rawMessage}`;
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    model: 'gemini-4-hydrogen',
    brand: 'Astrolabe AI',
    configured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Prompt enhancement endpoint
app.post('/api/enhance-prompt', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = createGeminiClient();
    const response = await withExponentialBackoff(() =>
      ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `You are an expert AI prompt engineer. Improve and clarify the following prompt so an AI gives the most accurate, comprehensive answer while preserving the user's intent and language (Bengali if input is Bengali, English if English). Return ONLY the improved prompt text with no quotes or preamble.\n\nPrompt: "${prompt}"`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      })
    );

    const enhancedPrompt = response.text?.trim() || prompt;
    res.json({ enhancedPrompt });
  } catch (error: any) {
    console.error('Enhance prompt error:', error);
    res.status(500).json({ error: formatReadableError(error) });
  }
});

// Streaming chat endpoint (SSE)
app.post('/api/chat/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  let heartbeatTimer: NodeJS.Timeout | null = null;

  try {
    const {
      messages,
      model = 'astrolabe-3.5-sonnet',
      systemInstruction,
      responseStyle = 'default',
      enableThinking = false,
      useSearch = false,
    } = req.body;

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

    const thinkingGuidance = enableThinking || model === 'astrolabe-thinking'
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

    const config: any = {
      systemInstruction: fullSystemInstruction,
      thinkingConfig: { thinkingLevel },
    };

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    let stream: any;
    try {
      stream = await withExponentialBackoff(() =>
        ai.models.generateContentStream({
          model: geminiModel,
          contents,
          config,
        })
      );
    } catch (searchErr: any) {
      if (useSearch) {
        const { tools: _dropped, ...standardConfig } = config;
        stream = await withExponentialBackoff(() =>
          ai.models.generateContentStream({
            model: geminiModel,
            contents,
            config: standardConfig,
          })
        );
      } else {
        throw searchErr;
      }
    }

    const collectedSources = new Map<string, { title: string; uri: string }>();

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
        if ((res as any).flush) (res as any).flush();
      }

      const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
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

// Non-streaming chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages,
      model = 'astrolabe-3.5-sonnet',
      systemInstruction,
      responseStyle = 'default',
      enableThinking = false,
      useSearch = false,
    } = req.body;

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

    const config: any = {
      systemInstruction: fullSystemInstruction,
      thinkingConfig: { thinkingLevel },
    };
    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await withExponentialBackoff(() =>
      ai.models.generateContent({
        model: geminiModel,
        contents,
        config,
      })
    );

    res.json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Astrolabe /api/chat error:', error);
    res.status(500).json({ error: formatReadableError(error) });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Astrolabe AI server running at http://localhost:${PORT}`);
  });
}

export { app };
export default app;

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
