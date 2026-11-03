import React, { useState } from 'react';
import { marked } from 'marked';
import { Check, Copy, Code2 } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
  className?: string;
  onCodeArtifactClick?: (code: string, language: string) => void;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({
  content,
  className = '',
  onCodeArtifactClick,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split markdown into code blocks vs regular markdown sections
  // so we can render rich, interactive code cards with copy and preview
  const parseSections = () => {
    const parts: Array<{ type: 'markdown' | 'code'; text: string; language?: string }> = [];
    const codeBlockRegex = /```([a-zA-Z0-9_\-\.\+]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'markdown',
          text: content.slice(lastIndex, match.index),
        });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'plaintext',
        text: match[2].trimEnd(),
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'markdown',
        text: content.slice(lastIndex),
      });
    }

    return parts;
  };

  const sections = parseSections();

  return (
    <div className={`castle-markdown space-y-4 text-[15px] ${className}`}>
      {sections.map((sec, idx) => {
        if (sec.type === 'code') {
          const isCopied = copiedIndex === idx;
          const isInteractive = ['html', 'svg', 'javascript', 'jsx', 'tsx', 'css'].includes(
            (sec.language || '').toLowerCase()
          );

          return (
            <div
              key={idx}
              className="my-3 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-[#121215] text-zinc-100 shadow-xs font-mono-castle"
            >
              {/* Code block header */}
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-zinc-300" />
                  <span className="font-semibold uppercase tracking-wider text-[11px]">
                    {sec.language || 'code'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isInteractive && onCodeArtifactClick && (
                    <button
                      onClick={() => onCodeArtifactClick(sec.text, sec.language || 'html')}
                      className="text-[11px] px-2.5 py-0.5 rounded-md bg-white text-zinc-950 hover:bg-zinc-200 font-medium transition-colors cursor-pointer"
                    >
                      Open in Artifacts
                    </button>
                  )}
                  <button
                    onClick={() => handleCopy(sec.text, idx)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-[#383633] transition-colors cursor-pointer text-[#C4C0B7]"
                    title="Copy code"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 text-[11px]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code block body */}
              <div className="p-4 overflow-x-auto text-[13px] leading-relaxed max-h-[500px]">
                <pre className="m-0 font-mono-castle whitespace-pre">
                  <code>{sec.text}</code>
                </pre>
              </div>
            </div>
          );
        }

        // Standard markdown block
        const html = marked.parse(sec.text, { async: false, breaks: true }) as string;
        return (
          <div
            key={idx}
            className="prose-content leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
};
