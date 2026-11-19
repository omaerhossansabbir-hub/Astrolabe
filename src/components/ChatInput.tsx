import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Square,
  Paperclip,
  Brain,
  X,
  FileText,
  Mic,
  MicOff,
  Sparkles,
  Loader2,
  Globe,
  Code2,
} from 'lucide-react';
import { FileAttachment } from '../types';

interface ChatInputProps {
  onSendMessage: (content: string, attachments: FileAttachment[]) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  enableThinking: boolean;
  onToggleThinking: () => void;
  useSearch: boolean;
  onToggleSearch: () => void;
  placeholder?: string;
  defaultLanguage?: 'auto' | 'bn' | 'en';
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  enableThinking,
  onToggleThinking,
  useSearch,
  onToggleSearch,
  placeholder = 'Ask Astrolabe AI anything...',
  defaultLanguage = 'auto',
}) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceLang] = useState<'bn-BD' | 'en-US'>(
    defaultLanguage === 'en' ? 'en-US' : 'bn-BD'
  );
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  }, [input]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if ((!input.trim() && attachments.length === 0) || isStreaming) return;
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    }
    onSendMessage(input.trim(), attachments);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        voiceLang === 'bn-BD'
          ? 'আপনার ব্রাউজারে স্পিচ রিকগনিশন সমর্থিত নয়। অনুগ্রহ করে ক্রোম বা এজ ব্রাউজার ব্যবহার করুন।'
          : 'Speech Recognition is not supported in this browser. Please use Chrome or Edge.'
      );
      setTimeout(() => setVoiceError(null), 5000);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = voiceLang;
      recognition.continuous = true;
      recognition.interimResults = true;

      const baseInput = input.trim();

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const combined = `${finalTranscript} ${interimTranscript}`.trim();
        if (combined) {
          setInput(baseInput ? `${baseInput} ${combined}` : combined);
        }
      };

      recognition.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsListening(false);
        if (err.error === 'not-allowed') {
          setVoiceError('মাইক্রোফোন ব্যবহারের অনুমতি দিন (Please allow microphone access)');
          setTimeout(() => setVoiceError(null), 4000);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setIsListening(false);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!input.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input.trim() }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        setInput(data.enhancedPrompt);
      }
    } catch (err) {
      console.error('Prompt enhancement error:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const isImage = file.type.startsWith('image/');

      if (isImage) {
        reader.onload = () => {
          setAttachments((prev) => [
            ...prev,
            {
              id: `att-${Date.now()}-${Math.random()}`,
              name: file.name,
              type: file.type,
              size: file.size,
              base64: reader.result as string,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = () => {
          setAttachments((prev) => [
            ...prev,
            {
              id: `att-${Date.now()}-${Math.random()}`,
              name: file.name,
              type: file.type || 'text/plain',
              size: file.size,
              text: reader.result as string,
            },
          ]);
        };
        reader.readAsText(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-1">
      <div
        className={`relative rounded-2xl bg-white dark:bg-[#141417] border transition-all shadow-lg shadow-black/5 ${
          isListening
            ? 'border-black dark:border-white ring-2 ring-black/20 dark:ring-white/20'
            : 'border-zinc-200 dark:border-zinc-800 focus-within:border-black dark:focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-black/5 dark:focus-within:ring-white/10'
        }`}
      >
        {/* Voice Error Banner */}
        {voiceError && (
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 rounded-t-2xl text-xs text-zinc-800 dark:text-zinc-200">
            <span>{voiceError}</span>
            <button
              type="button"
              onClick={() => setVoiceError(null)}
              className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Voice Listening Active Banner */}
        {isListening && (
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black border-b border-zinc-800 dark:border-zinc-200 rounded-t-2xl text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white dark:bg-black opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white dark:bg-black"></span>
              </span>
              <span className="font-semibold">
                Listening... Speak in Bengali or English
              </span>
            </div>

            <button
              type="button"
              onClick={toggleVoiceInput}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white text-black dark:bg-black dark:text-white cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 pb-0">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
              >
                {att.base64 ? (
                  <img
                    src={att.base64}
                    alt={att.name}
                    className="w-5 h-5 rounded object-cover"
                  />
                ) : (
                  <FileText className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                )}
                <span className="truncate max-w-[120px] font-medium text-[11px]">
                  {att.name}
                </span>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'Speak now, your speech will appear here...' : placeholder}
          rows={1}
          className="w-full px-4 pt-3.5 pb-2 text-[15px] bg-transparent text-zinc-950 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none resize-none leading-relaxed"
          style={{ minHeight: '52px' }}
        />

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-1 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Attach files or images"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Web Search Grounding Toggle (ChatGPT Search / Gemini style) */}
            <button
              type="button"
              onClick={onToggleSearch}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                useSearch
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white'
              }`}
              title="Search the web for live, up-to-date answers"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search</span>
            </button>

            {/* Deep Reasoning Toggle */}
            <button
              type="button"
              onClick={onToggleThinking}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                enableThinking
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white'
              }`}
              title="Toggle step-by-step deep reasoning"
            >
              <Brain className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reason</span>
            </button>

            {/* Interactive Artifacts Quick Action */}
            <button
              type="button"
              onClick={() => {
                if (!input.includes('Artifact') && !input.includes('আর্টিফ্যাক্ট')) {
                  setInput((prev) =>
                    prev.trim()
                      ? `${prev.trim()} (Build this as an interactive Astrolabe Artifact)`
                      : 'Build a complete interactive HTML/CSS/JS web app as an Astrolabe Artifact: '
                  );
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-all cursor-pointer"
              title="Build an interactive app or UI artifact"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Artifact</span>
            </button>

            {/* Prompt Enhancer */}
            {input.trim().length > 3 && (
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={isEnhancing}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer disabled:opacity-50"
                title="Improve prompt clarity"
              >
                {isEnhancing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                <span className="hidden lg:inline">Enhance</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {wordCount > 0 && (
              <span className="hidden sm:inline text-[11px] text-zinc-400 font-mono-astrolabe pr-1">
                {wordCount}w
              </span>
            )}

            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-black text-white dark:bg-white dark:text-black animate-pulse'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white'
              }`}
              title={isListening ? 'Stop voice input' : 'Voice input'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                className="flex items-center justify-center w-8 h-8 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-85 transition-opacity cursor-pointer"
                title="Stop generating"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!input.trim() && attachments.length === 0}
                className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all cursor-pointer ${
                  input.trim() || attachments.length > 0
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs hover:opacity-85'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                }`}
                title="Send message (Enter)"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="mt-2 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
        Astrolabe AI can make mistakes. Consider checking important information.
      </p>
    </div>
  );
};
