import React from 'react';
import {
  BookOpen,
  Layout,
  Terminal,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { AstrolabeLogo } from './AstrolabeLogo';

interface WelcomeScreenProps {
  onSelectPrompt: (promptText: string) => void;
  userName?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectPrompt,
  userName = 'Friend',
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const PROMPT_CARDS = [
    {
      category: 'Code & Artifacts',
      icon: <Terminal className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />,
      title: 'Build an Interactive Pomodoro Timer & Focus App',
      prompt:
        'Build a sleek, minimalist monochrome Pomodoro Focus Timer with task list and session tracking in HTML, CSS, and JavaScript as an interactive Astrolabe Artifact.',
    },
    {
      category: 'বাংলা জ্ঞান ও বিশ্লেষণ',
      icon: <BookOpen className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />,
      title: 'বাংলাদেশের অর্থনৈতিক সম্ভাবনা ও প্রযুক্তি খাত নিয়ে বিস্তারিত ব্যাখ্যা',
      prompt:
        'বাংলাদেশের অর্থনৈতিক উন্নয়ন এবং তথ্যপ্রযুক্তি ও এআই খাতের ভবিষ্যৎ সম্ভাবনা সম্পর্কে সহজ, তথ্যবহুল এবং পয়েন্ট আকারে একটি পূর্ণাঙ্গ বিশ্লেষণ দাও।',
    },
    {
      category: 'UI & Architecture',
      icon: <Layout className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />,
      title: 'Design a Responsive Personal Portfolio Landing Page',
      prompt:
        'Create a modern, responsive personal developer portfolio landing page in HTML and Tailwind CSS with dark monochrome styling as an Astrolabe Artifact.',
    },
    {
      category: 'Reasoning & Math',
      icon: <Globe className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />,
      title: 'Explain Quantum Computing Simply with Real-World Analogies',
      prompt:
        'Explain how quantum computing works compared to classical computers in clear, intuitive terms with step-by-step analogies and practical use cases.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full text-center min-h-[65vh]">
      {/* Pure Black & White Astrolabe Hero */}
      <div className="flex flex-col items-center mb-10">
        <AstrolabeLogo size={56} />

        <h1 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-zinc-950 dark:text-white">
          {getGreeting()}, {userName}
        </h1>

        <p className="mt-2.5 text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-lg font-sans">
          Astrolabe AI — Ask anything, write code, analyze documents, or build live interactive apps.
        </p>
      </div>

      {/* Monochrome Prompt Starters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
        {PROMPT_CARDS.map((card, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(card.prompt)}
            className="group p-4 rounded-2xl bg-white dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-500 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  {card.icon}
                  {card.category}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-black dark:text-white opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-zinc-950 dark:text-zinc-100 line-clamp-2 leading-snug">
                {card.title}
              </h3>
            </div>
            <div className="mt-3 text-[11px] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
              Ask Astrolabe AI
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
