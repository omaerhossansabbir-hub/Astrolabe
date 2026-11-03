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
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Message, AstrolabeArtifact } from '../types';
import { MarkdownView } from './MarkdownView';
import { AstrolabeLogo } from './AstrolabeLogo';

interface ChatMessageProps {
  message: Message;
  onOpenArtifact: (artifact: AstrolabeArtifact) => void;
  onRetry?: () => void;
  onEdit?: (newContent: string) => void;
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

  // Live timer for immediate feedback while Astrolabe is generating
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
        .slice(0, 1000);

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-4 px-4 sm:px-6">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 bg-[#EAE4D9] dark:bg-[#2B2926] text-[#1F1D1A] dark:text-[#EDEAE4] text-[15px] shadow-2xs leading-relaxed">
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/70 dark:bg-black/30 text-xs text-[#635F59] dark:text-[#A8A39A] border border-black/5"
                >
                  {att.base64 ? (
                    <img
                      src={att.base64}
                      alt={att.name}
                      className="w-4 h-4 rounded object-cover"
                    />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-[#D95D39]" />
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

  // Assistant (Astrolabe) message
  return (
    <div className="flex gap-3 sm:gap-4 my-6 px-4 sm:px-6 max-w-4xl mx-auto w-full group">
      {/* Astrolabe Avatar */}
      <div className="shrink-0 mt-0.5">
        <AstrolabeLogo size={28} />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        {/* Thinking Accordion (Extended reasoning) */}
        {message.thinking && (
          <div className="rounded-xl border border-[#E8E2D7] dark:border-[#33302B] bg-[#F7F4EE] dark:bg-[#201F1D] overflow-hidden text-xs">
            <button
              onClick={() => setThinkingExpanded(!thinkingExpanded)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-[#736E65] dark:text-[#9E9990] hover:text-[#1F1D1A] dark:hover:text-[#EDEAE4] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold">Astrolabe Thinking Process</span>
                {message.thinkingTime && (
                  <span className="text-[11px] text-[#8E8980]">
                    • Thought for {message.thinkingTime.toFixed(1)}s
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
              <div className="px-3.5 pb-3 pt-1 text-[12px] text-[#635F59] dark:text-[#A8A39A] whitespace-pre-wrap font-mono-castle border-t border-[#E8E2D7]/60 dark:border-[#33302B]/60 leading-relaxed max-h-60 overflow-y-auto">
                {message.thinking}
              </div>
            )}
          </div>
        )}

        {/* Inline Artifact Card */}
        {message.artifact && (
          <div
            onClick={() => onOpenArtifact(message.artifact!)}
            className="group/card flex items-center justify-between p-3.5 rounded-xl border border-[#D95D39]/30 bg-gradient-to-r from-[#FAF6EE] to-[#FFF9F5] dark:from-[#262320] dark:to-[#22201E] hover:border-[#D95D39] shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#D95D39]/10 text-[#D95D39] shrink-0 group-hover/card:scale-105 transition-transform">
                {message.artifact.language === 'svg' ? (
                  <Layers className="w-5 h-5" />
                ) : (
                  <Code2 className="w-5 h-5" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-[#1F1D1A] dark:text-[#EDEAE4] truncate">
                    {message.artifact.title}
                  </h4>
                  <span className="uppercase text-[10px] font-mono-castle font-semibold px-1.5 py-0.2 rounded bg-[#D95D39]/15 text-[#D95D39]">
                    {message.artifact.language}
                  </span>
                </div>
                <p className="text-[12px] text-[#736E65] dark:text-[#9E9990] mt-0.5 truncate">
                  Click to open interactive preview & source code in Astrolabe Artifacts viewer
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D95D39] pl-3 shrink-0">
              <span className="hidden sm:inline">Open Artifact</span>
              <ExternalLink className="w-4 h-4 group-hover/card:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}

        {/* Instant Animated Feedback while Waiting for First Words */}
        {isStreaming && !message.content && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#FAF7F0] dark:bg-[#201F1D] border border-[#E8E2D7] dark:border-[#33302B] animate-pulse">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#D95D39]/10 text-[#D95D39]">
              <Loader2 className="w-4 h-4 animate-spin text-[#D95D39]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#1F1D1A] dark:text-[#EDEAE4]">
                  অ্যাস্ট্রো ল্যাব উত্তর সাজাচ্ছে...
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#D95D39]/15 text-[#D95D39] font-mono-castle font-medium">
                  {elapsedSeconds.toFixed(1)}s
                </span>
              </div>
              <p className="text-xs text-[#736E65] dark:text-[#9E9990] mt-0.5 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#D95D39]" />
                উচ্চগতির ইঞ্জিন দ্বারা বিশ্লেষণ চলছে (Analyzing prompt with instant stream)
              </p>
            </div>
          </div>
        )}

        {/* Message Markdown Body */}
        {message.content && (
          <div className="text-[15px] leading-relaxed text-[#1F1D1A] dark:text-[#EDEAE4]">
            <MarkdownView
              content={message.content}
              onCodeArtifactClick={(code, lang) => {
                const art: AstrolabeArtifact = {
                  id: `art-block-${Date.now()}`,
                  title: 'Extracted Code Artifact',
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
              <span className="inline-block w-2 h-4 ml-1 bg-[#D95D39] animate-pulse align-middle" />
            )}
          </div>
        )}

        {/* Error State Banner with Instant Retry */}
        {isError && (
          <div className="mt-2 p-3.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/60 dark:bg-red-950/20 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-red-800 dark:text-red-300 font-medium leading-relaxed">
                  {message.content || 'সংযোগ বিচ্ছিন্ন হয়েছে বা উত্তর প্রদানে সাময়িক সমস্যা হয়েছে।'}
                </p>
                {onRetry && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      onClick={onRetry}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D95D39] hover:bg-[#c44f2c] text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      আবার চেষ্টা করুন (Retry)
                    </button>
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[#635F59] dark:text-[#A8A39A] text-xs transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      কপি করুন
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions Toolbar */}
        {!isStreaming && !isError && message.content && (
          <div className="flex items-center gap-1 pt-1 text-xs text-[#8E8980]">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 p-1.5 rounded-md hover:bg-[#EAE4D9] dark:hover:bg-[#282725] hover:text-[#1F1D1A] dark:hover:text-[#EDEAE4] transition-colors cursor-pointer"
              title="Copy response"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 text-[11px]">Copied</span>
                </>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={handleSpeak}
              className={`p-1.5 rounded-md hover:bg-[#EAE4D9] dark:hover:bg-[#282725] transition-colors cursor-pointer ${
                isSpeaking ? 'text-[#D95D39]' : 'hover:text-[#1F1D1A] dark:hover:text-[#EDEAE4]'
              }`}
              title={isSpeaking ? 'Stop reading' : 'Read aloud'}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {onRetry && (
              <button
                onClick={onRetry}
                className="p-1.5 rounded-md hover:bg-[#EAE4D9] dark:hover:bg-[#282725] hover:text-[#1F1D1A] dark:hover:text-[#EDEAE4] transition-colors cursor-pointer"
                title="Regenerate response"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="w-[1px] h-3 bg-[#E8E2D7] dark:bg-[#33302B] mx-1" />

            <button
              onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
              className={`p-1.5 rounded-md hover:bg-[#EAE4D9] dark:hover:bg-[#282725] transition-colors cursor-pointer ${
                feedback === 'up' ? 'text-emerald-600' : 'hover:text-[#1F1D1A]'
              }`}
              title="Good response"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
              className={`p-1.5 rounded-md hover:bg-[#EAE4D9] dark:hover:bg-[#282725] transition-colors cursor-pointer ${
                feedback === 'down' ? 'text-red-500' : 'hover:text-[#1F1D1A]'
              }`}
              title="Bad response"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
