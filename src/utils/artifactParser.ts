import { AstrolabeArtifact, ArtifactType } from '../types';

export interface ParsedMessageContent {
  cleanedText: string;
  thinking?: string;
  artifact?: AstrolabeArtifact;
}

/**
 * Extracts <astrolabeThinking>...</astrolabeThinking> and <astrolabeArtifact>...</astrolabeArtifact>
 * (with backward compatibility for <castleArtifact> tags)
 */
export function parseAstrolabeResponse(rawText: string, messageId: string = 'art-1'): ParsedMessageContent {
  let text = rawText;
  let thinking: string | undefined;
  let artifact: AstrolabeArtifact | undefined;

  // 1. Extract Thinking tags: <astrolabeThinking> or <castleThinking> or <thinking>
  const thinkingMatch =
    text.match(/<astrolabeThinking>([\s\S]*?)<\/astrolabeThinking>/i) ||
    text.match(/<castleThinking>([\s\S]*?)<\/castleThinking>/i) ||
    text.match(/<thinking>([\s\S]*?)<\/thinking>/i);

  if (thinkingMatch) {
    thinking = thinkingMatch[1].trim();
    text = text.replace(thinkingMatch[0], '').trim();
  }

  // 2. Extract explicit <astrolabeArtifact ...>...</astrolabeArtifact> or <castleArtifact ...>
  const artifactRegex = /<(?:astrolabeArtifact|castleArtifact)(?:\s+id="([^"]*)")?(?:\s+type="([^"]*)")?(?:\s+language="([^"]*)")?(?:\s+title="([^"]*)")?>([\s\S]*?)<\/(?:astrolabeArtifact|castleArtifact)>/i;
  const artifactMatch = text.match(artifactRegex);

  if (artifactMatch) {
    const rawId = artifactMatch[1] || `art-${Date.now()}`;
    const rawType = (artifactMatch[2] || 'application/vnd.astrolabe.code') as ArtifactType;
    const rawLang = artifactMatch[3] || 'html';
    const rawTitle = artifactMatch[4] || 'Astrolabe Artifact';
    const rawContent = artifactMatch[5].trim();

    artifact = {
      id: rawId,
      title: rawTitle,
      type: rawType,
      language: rawLang.toLowerCase(),
      content: rawContent,
      version: 1,
      createdAt: Date.now(),
    };

    text = text.replace(artifactMatch[0], '').trim();
  } else {
    // 3. Fallback: Check if message contains a complete HTML / SVG / Mermaid / Python code block
    const codeBlockMatch = text.match(/```(html|svg|jsx|javascript|python|css|mermaid)\n([\s\S]{120,}?)```/i);
    if (codeBlockMatch) {
      const lang = codeBlockMatch[1].toLowerCase();
      const code = codeBlockMatch[2].trim();
      const isHtmlApp =
        lang === 'html' &&
        (code.includes('<!DOCTYPE') ||
          code.includes('<html') ||
          code.includes('<canvas') ||
          code.includes('<script') ||
          code.includes('<div'));
      const isSvg = lang === 'svg' || (lang === 'html' && code.startsWith('<svg'));
      const isMermaid = lang === 'mermaid';

      if (isHtmlApp || isSvg || isMermaid) {
        const headingMatch = text.match(/###?\s+(.+)/);
        const title = headingMatch
          ? headingMatch[1].trim()
          : isSvg
          ? 'Vector Astrolabe Illustration'
          : isMermaid
          ? 'Architecture Diagram'
          : 'Interactive Application';

        artifact = {
          id: `art-${messageId}`,
          title,
          type: isSvg
            ? 'image/svg+xml'
            : isMermaid
            ? 'application/vnd.astrolabe.diagram'
            : 'application/vnd.astrolabe.code',
          language: isSvg ? 'svg' : isMermaid ? 'mermaid' : 'html',
          content: code,
          version: 1,
          createdAt: Date.now(),
        };
      }
    }
  }

  return {
    cleanedText: text,
    thinking,
    artifact,
  };
}

export const parseCastleResponse = parseAstrolabeResponse;

/**
 * Prepares standalone HTML for safe iframe execution with Mermaid support
 */
export function buildIframeContent(artifact: AstrolabeArtifact): string {
  const { language, content } = artifact;

  if (language === 'mermaid') {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 30px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #FAF9F5;
      font-family: system-ui, sans-serif;
    }
    .mermaid {
      background: #ffffff;
      padding: 24px;
      border-radius: 12px;
      border: 1px solid #E8E2D7;
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
    }
  </style>
</head>
<body>
  <div class="mermaid">
    ${escapeHtml(content)}
  </div>
  <script>
    mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
  </script>
</body>
</html>`;
  }

  if (language === 'svg' || artifact.type === 'image/svg+xml') {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #FAF9F5;
      box-sizing: border-box;
      font-family: system-ui, sans-serif;
    }
    svg {
      max-width: 100%;
      height: auto;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.06));
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
  }

  if (language === 'html') {
    if (content.includes('<html') || content.includes('<!DOCTYPE')) {
      return content;
    }
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #faf9f6;
      color: #1e1e1e;
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
  }

  // Fallback
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: system-ui, sans-serif;
      padding: 20px;
      line-height: 1.6;
      color: #222;
      background: #FAF9F5;
    }
    pre {
      background: #F4F0E8;
      padding: 14px;
      border-radius: 8px;
      overflow-x: auto;
      font-family: monospace;
      border: 1px solid #E8E2D7;
    }
  </style>
</head>
<body>
  <pre>${escapeHtml(content)}</pre>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
