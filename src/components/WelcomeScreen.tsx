import React from 'react';
import {
  Sparkles,
  BookOpen,
  Layout,
  Terminal,
  ArrowRight,
  Palette,
  Compass,
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
      category: 'Interactive Artifact',
      icon: <Terminal className="w-4 h-4 text-[#D95D39]" />,
      title: 'Build a Retro Space Shooter Game in HTML5 Canvas',
      prompt: 'Write a complete, playable retro arcade space shooter mini-game in HTML5 Canvas with keyboard controls, sound synthesis, and score tracking as an interactive Astrolabe Artifact.',
    },
    {
      category: 'বাংলা সাহিত্য ও দর্শন',
      icon: <BookOpen className="w-4 h-4 text-emerald-600" />,
      title: 'বাংলায় আধুনিক জীবনের একাকিত্ব নিয়ে একটি দার্শনিক কবিতা ও প্রবন্ধ',
      prompt: 'বাংলায় আধুনিক নাগরিক জীবনের ব্যস্ততা ও মানুষের ভেতরের আত্মিক একাকিত্ব নিয়ে একটি গভীর ভাবগম্ভীর কবিতা এবং সাথে একটি দার্শনিক বিশ্লেষণ লেখো।',
    },
    {
      category: 'UI & Dashboard',
      icon: <Layout className="w-4 h-4 text-indigo-600" />,
      title: 'Create an Interactive SaaS Analytics Dashboard',
      prompt: 'Create a modern, interactive SaaS metrics dashboard in HTML and Tailwind CSS with metric cards, chart filter tabs, and animated SVG trend lines as an Astrolabe Artifact.',
    },
    {
      category: 'Celestial Vector Art',
      icon: <Compass className="w-4 h-4 text-amber-600" />,
      title: 'Generate an Intricate Golden Astrolabe Under Moonlight',
      prompt: 'Generate an intricate, scalable SVG artwork of a golden celestial astrolabe with constellation markings, lunar phases, and starry twilight night sky as an Astrolabe Artifact.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full text-center">
      {/* Brand Icon & Welcome Headline */}
      <div className="flex flex-col items-center mb-8">
        <AstrolabeLogo size={52} />

        <h1 className="mt-5 font-serif-castle text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#1F1D1A] dark:text-[#EDEAE4]">
          {getGreeting()}, {userName}
        </h1>

        <p className="mt-2 text-sm sm:text-base text-[#736E65] dark:text-[#9E9990] max-w-md font-sans">
          How can Astrolabe navigate your ideas, code, or writing today?
        </p>
      </div>

      {/* Suggested Inspiration Prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
        {PROMPT_CARDS.map((card, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(card.prompt)}
            className="group p-4 rounded-2xl bg-white dark:bg-[#232220] hover:bg-[#FAF6EE] dark:hover:bg-[#2B2926] border border-[#E8E2D7] dark:border-[#33302B] shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8E8980] uppercase tracking-wider">
                  {card.icon}
                  {card.category}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D95D39] opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-[#1F1D1A] dark:text-[#EDEAE4] line-clamp-2 leading-snug">
                {card.title}
              </h3>
            </div>
            <div className="mt-2.5 text-[11px] text-[#8E8980] line-clamp-1">
              Click to run with Astrolabe
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
