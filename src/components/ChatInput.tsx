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
  Film,
  Code2,
} from 'lucide-react';
import { FileAttachment } from '../types';

interface ChatInputProps {
  onSendMessage: (content: string, attachments: FileAttachment[]) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  enableThinking: boolean;
  onToggleThinking: () => void;
  placeholder?: string;
  defaultLanguage?: 'auto' | 'bn' | 'en';
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  enableThinking,
  onToggleThinking,
  placeholder = 'Reply to Astrolabe...',
  defaultLanguage = 'auto',
}) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'bn-BD' | 'en-US'>(
    defaultLanguage === 'en' ? 'en-US' : 'bn-BD'
  );
  const [isEnhancing, setIsEnhancing] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  }, [input]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
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
      } catch (e) {
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

    // Web Speech API Voice Prompt handler
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const toggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        voiceLang === 'bn-BD'
          ? 'আপনার ব্রাউজারে স্পিচ রিকগনিশন সমর্থন করে না। অনুগ্রহ করে ক্রোম বা এজ ব্রাউজার ব্যবহার করুন।'
          : 'Speech Recognition is not supported in this browser. Please use Google Chrome or Edge.'
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

  // Enhance prompt with AI
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
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      {/* Container Box styled in Claude's signature floating capsule */}
      <div
        className={`relative rounded-2xl bg-white dark:bg-[#232220] border transition-all shadow-lg shadow-black/5 ${
          isListening
            ? 'border-red-500 ring-2 ring-red-500/20'
            : 'border-[#E2DCD2] dark:border-[#383531] focus-within:border-[#D95D39]/50 focus-within:ring-2 focus-within:ring-[#D95D39]/15'
        }`}
      >
        {/* Voice Error Banner */}
        {voiceError && (
          <div className="flex items-center justify-between px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/50 rounded-t-2xl text-xs text-amber-800 dark:text-amber-300">
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
          <div className="flex items-center justify-between px-4 py-2 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-900/50 rounded-t-2xl text-xs text-red-600 dark:text-red-400 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="font-semibold">
                শুনছি... কথা বলুন (Listening... speak naturally in Bengali or English)
              </span>
            </div>

            <button
              type="button"
              onClick={toggleVoiceInput}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-xs"
            >
              সম্পন্ন (Done)
            </button>
          </div>
        )}

        {/* Attachment preview pills */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 pb-0">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#FAF6EE] dark:bg-[#2C2A27] border border-[#E8E2D7] dark:border-[#383531] text-xs text-[#1F1D1A] dark:text-[#EDEAE4]"
              >
                {att.base64 ? (
                  <img
                    src={att.base64}
                    alt={att.name}
                    className="w-5 h-5 rounded object-cover"
                  />
                ) : (
                  <FileText className="w-4 h-4 text-[#D95D39]" />
                )}
                <span className="truncate max-w-[120px] font-medium text-[11px]">
                  {att.name}
                </span>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[#8E8980] hover:text-[#1F1D1A] cursor-pointer"
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
          className="w-full px-4 pt-3.5 pb-2 text-[15px] bg-transparent text-[#1F1D1A] dark:text-[#EDEAE4] placeholder-[#8E8980] outline-none resize-none leading-relaxed"
          style={{ minHeight: '52px' }}
        />

        {/* Bottom Control Bar - Claude.ai layout */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-[#F2ECE3] dark:border-[#2C2A28]">
          {/* Left Controls: File Attachment, Artifacts Builder, Video Studio, Thinking, Prompt Enhancer */}
          <div className="flex items-center gap-1.5 flex-wrap">
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
              className="p-2 rounded-xl text-[#635F59] dark:text-[#A8A39A] hover:bg-[#FAF6EE] dark:hover:bg-[#2B2926] hover:text-[#1F1D1A] dark:hover:text-[#EDEAE4] transition-colors cursor-pointer"
              title="Attach documents, images, or code"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Artifacts / Interactive Apps Tool */}
            <button
              type="button"
              onClick={() => {
                if (!input.includes('Artifact') && !input.includes('আর্টিফ্যাক্ট')) {
                  setInput((prev) =>
                    prev.trim()
                      ? `${prev.trim()} (Build this as a complete interactive Astrolabe Artifact with live preview)`
                      : 'Build a complete interactive web application with HTML, CSS, and JavaScript as an Astrolabe Artifact: '
                  );
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#635F59] dark:text-[#A8A39A] hover:bg-[#FAF6EE] dark:hover:bg-[#2B2926] hover:text-[#D95D39] transition-all cursor-pointer"
              title="Build interactive websites, games, software, and apps with live preview"
            >
              <Code2 className="w-3.5 h-3.5 text-[#D95D39]" />
              <span className="hidden sm:inline">Artifacts</span>
            </button>

            {/* Video Studio & Storyboard Tool */}
            <button
              type="button"
              onClick={() => {
                if (!input.includes('video') && !input.includes('ভিডিও')) {
                  setInput((prev) =>
                    prev.trim()
                      ? `${prev.trim()} (Generate a cinematic AI video production storyboard, camera directions, and prompts for Sora/Veo/Runway)`
                      : 'Create a cinematic multi-scene AI video storyboard, camera movements, and production prompts for: '
                  );
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#635F59] dark:text-[#A8A39A] hover:bg-[#FAF6EE] dark:hover:bg-[#2B2926] hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer"
              title="Create cinematic AI video storyboards and production prompts"
            >
              <Film className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Video Studio</span>
            </button>

            {/* Extended Thinking Toggle */}
            <button
              type="button"
              onClick={onToggleThinking}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                enableThinking
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 ring-1 ring-purple-300 dark:ring-purple-700/50'
                  : 'text-[#736E65] dark:text-[#9E9990] hover:bg-[#FAF6EE] dark:hover:bg-[#2B2926]'
              }`}
              title="Toggle extended analytical thinking"
            >
              <Brain className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden md:inline">Thinking</span>
            </button>

            {/* AI Prompt Enhancer ✨ */}
            {input.trim().length > 3 && (
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={isEnhancing}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 text-xs font-medium hover:bg-amber-100 transition-all cursor-pointer disabled:opacity-50"
                title="Automatically improve and expand your prompt"
              >
                {isEnhancing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 text-amber-500" />
                )}
                <span className="hidden lg:inline">Enhance</span>
              </button>
            )}
          </div>

          {/* Right Controls: Word count, Voice Microphone (adjacent to Send), and Send / Stop button */}
          <div className="flex items-center gap-1.5">
            {wordCount > 0 && (
              <span className="hidden sm:inline text-[11px] text-[#8E8980] font-mono-castle pr-1">
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>
            )}

            {/* Voice Input Microphone Button - Directly adjacent to Send (Claude.ai position) */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-md ring-2 ring-red-400'
                  : 'text-[#635F59] dark:text-[#A8A39A] hover:bg-[#FAF6EE] dark:hover:bg-[#2B2926] hover:text-[#D95D39]'
              }`}
              title={isListening ? 'Click to stop listening' : 'Dictate with voice prompt (বাংলা বা ইংরেজিতে কথা বলুন)'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-white" />
              ) : (
                <Mic className="w-4 h-4 text-[#D95D39]" />
              )}
            </button>

            {/* Send / Stop Action Button */}
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#1F1D1A] text-white hover:bg-[#33302B] transition-colors cursor-pointer"
                title="Stop generation"
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
                    ? 'bg-[#D95D39] text-white shadow-xs hover:bg-[#C44F2C]'
                    : 'bg-[#EAE4D9] dark:bg-[#2F2D2A] text-[#8E8980] cursor-not-allowed'
                }`}
                title="Send message (Enter)"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="mt-2 text-center text-[11px] text-[#9E9990] dark:text-[#736E65]">
        Astrolabe provides lightning-fast reasoning across all languages. Verify critical code, facts, or data.
      </p>
    </div>
  );
};
