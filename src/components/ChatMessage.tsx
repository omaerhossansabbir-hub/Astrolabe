import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Brain,
  ChevronDown,
  ChevronRight,
  Code2,
  ExternalLink,
  Layers,
  FileText,
  AlertCircle,
  Globe,
  Loader2,
} from 'lucide-react';
import { Message, AstrolabeArtifact } from '../types';
import { MarkdownView } from './MarkdownView';
import { AstrolabeLogo } from './AstrolabeLogo';

interface ChatMessageProps {
  message: Message;
  onOpenArtifact: (artifact: AstrolabeArtifact) => void;
  onRetry?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onOpenArtifact,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false);
  const [thinkingExpanded, setThinkingExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const isUser = message.role === 'user';
  const isStreaming = message.status === 'streaming';
  const isError = message.status === 'error';

  useEffect(() => {
    if (!isStreaming) {
      setElapsedSeconds(0);
      return;
    }
    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsedSeconds(Math.round(((Date.now() - startTime) / 1000) * 10) / 10);
    }, 100);
    return () => clearInterval(interval);
  }, [isStreaming]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const textToSpeak = message.content
        .replace(/```[\s\S]*?```/g, 'Code block omitted.')
        .replace(/<[^>]*>/g, '')
        .slice(0, 1500);

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-4 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 text-[15px] leading-relaxed border border-zinc-200/80 dark:border-zinc-700/60">
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                >
                  {att.base64 ? (
                    <img
                      src={att.base64}
                      alt={att.name}
                      className="w-4 h-4 rounded object-cover"
                    />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                  )}
                  <span className="truncate max-w-[140px] font-medium">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4 my-6 px-4 sm:px-6 max-w-4xl mx-auto w-full group">
      {/* Pure Black & White Astrolabe Avatar */}
      <div className="shrink-0 mt-0.5">
        <AstrolabeLogo size={28} />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        {/* Thinking Accordion */}
        {message.thinking && (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 overflow-hidden text-xs">
            <button
              onClick={() => setThinkingExpanded(!thinkingExpanded)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200" />
                <span className="font-semibold">Reasoning Process</span>
                {message.thinkingTime && (
                  <span className="text-[11px] text-zinc-400">
                    • {message.thinkingTime.toFixed(1)}s
                  </span>
                )}
              </div>
              {thinkingExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {thinkingExpanded && (
              <div className="px-3.5 pb-3 pt-1 text-[12px] text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap font-mono-astrolabe border-t border-zinc-200 dark:border-zinc-800 leading-relaxed max-h-60 overflow-y-auto">
                {message.thinking}
              </div>
            )}
          </div>
        )}

        {/* Inline Artifact Card */}
        {message.artifact && (
          <div
            onClick={() => onOpenArtifact(message.artifact!)}
            className="group/card flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-black dark:hover:border-zinc-500 shadow-2xs transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white shrink-0">
                {message.artifact.language === 'svg' ? (
                  <Layers className="w-5 h-5" />
                ) : (
                  <Code2 className="w-5 h-5" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-zinc-950 dark:text-white truncate">
                    {message.artifact.title}
                  </h4>
                  <span className="uppercase text-[10px] font-mono-astrolabe font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                    {message.artifact.language}
                  </span>
                </div>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                  Click to open interactive preview & code
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white pl-3 shrink-0">
              <span className="hidden sm:inline">Open</span>
              <ExternalLink className="w-4 h-4 group-hover/card:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}

        {/* Streaming Loading Indicator */}
        {isStreaming && !message.content && (
          <div className="flex items-center gap-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Loader2 className="w-4 h-4 animate-spin text-black dark:text-white" />
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              Astrolabe AI is thinking...
            </span>
            <span className="font-mono-astrolabe text-[11px] text-zinc-400">
              {elapsedSeconds.toFixed(1)}s
            </span>
          </div>
        )}

        {/* Message Markdown Body */}
        {message.content && !isError && (
          <div className="text-[15px] leading-relaxed text-zinc-950 dark:text-zinc-100">
            <MarkdownView
              content={message.content}
              onCodeArtifactClick={(code, lang) => {
                const art: AstrolabeArtifact = {
                  id: `art-block-${Date.now()}`,
                  title: 'Code Artifact',
                  type: 'application/vnd.astrolabe.code',
                  language: lang,
                  content: code,
                  version: 1,
                  createdAt: Date.now(),
                };
                onOpenArtifact(art);
              }}
            />

            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-black dark:bg-white animate-pulse align-middle" />
            )}
          </div>
        )}

        {/* Web Grounding Sources */}
        {!isStreaming && message.sources && message.sources.length > 0 && (
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              <Globe className="w-3 h-3" />
              <span>Sources</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.sources.slice(0, 6).map((src, i) => (
                <a
                  key={i}
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-500 text-[11px] text-zinc-700 dark:text-zinc-300 max-w-[240px] truncate transition-colors"
                >
                  <span className="truncate">{src.title}</span>
                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Error State Banner with Instant Retry */}
        {isError && (
          <div className="mt-1 p-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-zinc-800 dark:text-zinc-200 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                  {message.content || 'Could not complete the response. Please try again.'}
                </p>
                {onRetry && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      onClick={onRetry}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:opacity-85 font-medium text-xs transition-opacity cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retry
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Monochrome Actions Toolbar */}
        {!isStreaming && !isError && message.content && (
          <div className="flex items-center gap-1 pt-1 text-xs text-zinc-500">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Copy response"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-black dark:text-white" />
                  <span className="text-black dark:text-white text-[11px]">Copied</span>
                </>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={handleSpeak}
              className={`p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                isSpeaking ? 'text-black dark:text-white font-bold' : 'hover:text-black dark:hover:text-white'
              }`}
              title={isSpeaking ? 'Stop reading' : 'Read aloud'}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {onRetry && (
              <button
                onClick={onRetry}
                className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                title="Regenerate response"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="w-[1px] h-3 bg-zinc-200 dark:bg-zinc-800 mx-1" />

            <button
              onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
              className={`p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                feedback === 'up' ? 'text-black dark:text-white' : 'hover:text-black dark:hover:text-white'
              }`}
              title="Helpful"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
              className={`p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                feedback === 'down' ? 'text-black dark:text-white' : 'hover:text-black dark:hover:text-white'
              }`}
              title="Not helpful"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
