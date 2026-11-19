import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  ChevronDown,
  Layers,
  Sparkles,
  Zap,
  Brain,
  Crown,
  FolderOpen,
  SlidersHorizontal,
  Sun,
  Moon,
  Plus,
} from 'lucide-react';
import { AstrolabeModel, ASTROLABE_MODELS, Project, ResponseStyle } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  chatTitle: string;
  selectedModel: AstrolabeModel;
  onSelectModel: (model: AstrolabeModel) => void;
  responseStyle: ResponseStyle;
  onSelectResponseStyle: (style: ResponseStyle) => void;
  activeProject?: Project;
  hasArtifacts: boolean;
  isArtifactsOpen: boolean;
  onToggleArtifacts: () => void;
  onNewChat: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  chatTitle,
  selectedModel,
  onSelectModel,
  responseStyle,
  onSelectResponseStyle,
  activeProject,
  hasArtifacts,
  isArtifactsOpen,
  onToggleArtifacts,
  onNewChat,
  isDarkTheme,
  onToggleTheme,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const styleDropdownRef = useRef<HTMLDivElement>(null);

  const currentModelInfo =
    ASTROLABE_MODELS.find((m) => m.id === selectedModel) || ASTROLABE_MODELS[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
      if (styleDropdownRef.current && !styleDropdownRef.current.contains(e.target as Node)) {
        setStyleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getModelIcon = (id: AstrolabeModel) => {
    switch (id) {
      case 'astrolabe-thinking':
        return <Brain className="w-4 h-4 text-zinc-950 dark:text-white" />;
      case 'astrolabe-3-opus':
        return <Crown className="w-4 h-4 text-zinc-950 dark:text-white" />;
      case 'astrolabe-3-haiku':
        return <Zap className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />;
      default:
        return <Sparkles className="w-4 h-4 text-zinc-950 dark:text-white" />;
    }
  };

  const STYLES: { id: ResponseStyle; label: string; desc: string }[] = [
    { id: 'default', label: 'Balanced (Standard)', desc: 'Clear, accurate, and well-structured' },
    { id: 'concise', label: 'Concise & Direct', desc: 'Brief, direct answers with minimal preamble' },
    { id: 'explanatory', label: 'In-Depth & Educational', desc: 'Comprehensive step-by-step explanations' },
    { id: 'creative', label: 'Creative & Expressive', desc: 'Rich prose, metaphors, and narrative flair' },
  ];

  return (
    <header className="relative flex items-center justify-between h-14 px-4 bg-white dark:bg-[#09090B] border-b border-zinc-200 dark:border-zinc-800/80 shrink-0 z-20">
      {/* Left: Sidebar Toggle, Model Selector (ChatGPT/Claude style) & Active Chat Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-1 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Model Selector Dropdown (Claude / ChatGPT Top-Left Position) */}
        <div className="relative" ref={modelDropdownRef}>
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-950 dark:text-white transition-all cursor-pointer"
          >
            {getModelIcon(currentModelInfo.id)}
            <span className="font-semibold hidden sm:inline">{currentModelInfo.name}</span>
            <span className="font-semibold sm:hidden">Astrolabe</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {modelDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Astrolabe AI Models
              </div>

              <div className="space-y-1">
                {ASTROLABE_MODELS.map((m) => {
                  const isSelected = m.id === selectedModel;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        onSelectModel(m.id);
                        setModelDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-100 dark:bg-zinc-800 ring-1 ring-black/20 dark:ring-white/25'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="mt-0.5">{getModelIcon(m.id)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-xs text-zinc-950 dark:text-white">
                            {m.name}
                          </span>
                          {m.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black font-semibold">
                              {m.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                          {m.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Active Chat Title & Project Context */}
        <div className="hidden md:flex items-center gap-2 min-w-0 pl-1">
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate max-w-[220px]">
            {chatTitle || 'New chat'}
          </span>

          {activeProject && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              <FolderOpen className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{activeProject.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: New Chat Quick Icon, Response Style, Theme Toggle, Artifacts Button */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Quick New Chat icon on mobile */}
        <button
          onClick={onNewChat}
          className="sm:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          title="New chat"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Response Style Picker */}
        <div className="relative hidden md:block" ref={styleDropdownRef}>
          <button
            onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400 transition-all cursor-pointer"
            title="Response Style"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="capitalize">{responseStyle}</span>
          </button>

          {styleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-2.5 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Response Style
              </div>
              <div className="space-y-1 mt-1">
                {STYLES.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      onSelectResponseStyle(st.id);
                      setStyleDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      responseStyle === st.id
                        ? 'bg-zinc-100 dark:bg-zinc-800 font-semibold text-black dark:text-white'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    <div>{st.label}</div>
                    <div className="text-[11px] font-normal text-zinc-500 mt-0.5">{st.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Light / Dark Theme Quick Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          title={isDarkTheme ? 'Switch to Light mode' : 'Switch to Dark mode'}
        >
          {isDarkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Artifacts Pane Toggle Button */}
        {hasArtifacts && (
          <button
            onClick={onToggleArtifacts}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isArtifactsOpen
                ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white'
            }`}
            title="Toggle Artifacts panel"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Artifacts</span>
          </button>
        )}
      </div>
    </header>
  );
};
