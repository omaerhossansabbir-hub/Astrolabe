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
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'astrolabe-3-opus':
        return <Crown className="w-4 h-4 text-amber-500" />;
      case 'astrolabe-3-haiku':
        return <Zap className="w-4 h-4 text-emerald-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#D95D39]" />;
    }
  };

  const STYLES: { id: ResponseStyle; label: string; desc: string }[] = [
    { id: 'default', label: 'Balanced (Standard)', desc: 'Poised, nuanced, and structurally articulate' },
    { id: 'concise', label: 'Concise & Direct', desc: 'Brief, clear answers with minimal preamble' },
    { id: 'explanatory', label: 'In-Depth & Educational', desc: 'Comprehensive step-by-step deep explanations' },
    { id: 'creative', label: 'Creative & Poetic', desc: 'Vivid prose, metaphors, and evocative style' },
  ];

  return (
    <header className="relative flex items-center justify-between h-14 px-4 bg-[#FAF9F5] dark:bg-[#1C1B1A] border-b border-[#E8E2D7] dark:border-[#2C2A27] shrink-0 z-20">
      {/* Left: Sidebar toggle & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-[#635F59] dark:text-[#A8A39A] hover:bg-[#EFECE5] dark:hover:bg-[#282725] transition-colors cursor-pointer"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-sm text-[#1F1D1A] dark:text-[#EDEAE4] truncate max-w-[180px] sm:max-w-[300px]">
            {chatTitle || 'New chat'}
          </span>

          {activeProject && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#EAE4D9] dark:bg-[#292825] text-xs text-[#635F59] dark:text-[#A8A39A] border border-[#E0D9CC] dark:border-[#383531]">
              <FolderOpen className="w-3 h-3 text-[#D95D39]" />
              <span className="truncate max-w-[120px]">{activeProject.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Response Style, Model Selector & Artifacts Button */}
      <div className="flex items-center gap-2">
        {/* Claude Response Style Picker */}
        <div className="relative hidden md:block" ref={styleDropdownRef}>
          <button
            onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-transparent hover:bg-[#F0EBE1] dark:hover:bg-[#282725] border border-transparent hover:border-[#E2DCD2] dark:hover:border-[#363430] text-xs text-[#635F59] dark:text-[#A8A39A] transition-all cursor-pointer"
            title="Response Style"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="capitalize">{responseStyle}</span>
          </button>

          {styleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#232220] border border-[#E2DCD2] dark:border-[#363430] shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-2.5 py-1 text-[11px] font-semibold text-[#8E8980] uppercase tracking-wider">
                Claude Response Style
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
                        ? 'bg-[#FAF6EE] dark:bg-[#2C2A27] font-semibold text-[#D95D39]'
                        : 'hover:bg-[#F7F4EE] dark:hover:bg-[#262523] text-[#1F1D1A] dark:text-[#EDEAE4]'
                    }`}
                  >
                    <div>{st.label}</div>
                    <div className="text-[11px] font-normal text-[#8E8980] mt-0.5">{st.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Model Selector Dropdown */}
        <div className="relative" ref={modelDropdownRef}>
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#242321] hover:bg-[#F6F3ED] dark:hover:bg-[#2C2A28] border border-[#E2DCD2] dark:border-[#363430] text-xs font-medium text-[#1F1D1A] dark:text-[#EDEAE4] shadow-2xs transition-all cursor-pointer"
          >
            {getModelIcon(currentModelInfo.id)}
            <span className="font-semibold hidden sm:inline">{currentModelInfo.name}</span>
            <span className="font-semibold sm:hidden">
              {currentModelInfo.id === 'astrolabe-thinking' ? 'Thinking' : 'Sonnet'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#8E8980]" />
          </button>

          {modelDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#232220] border border-[#E2DCD2] dark:border-[#363430] shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-[#8E8980] uppercase tracking-wider">
                Astrolabe Intelligence Models
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
                          ? 'bg-[#FAF6F0] dark:bg-[#2C2A27] ring-1 ring-[#D95D39]/30'
                          : 'hover:bg-[#F7F4EE] dark:hover:bg-[#262523]'
                      }`}
                    >
                      <div className="mt-0.5">{getModelIcon(m.id)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-[#1F1D1A] dark:text-[#EDEAE4]">
                            {m.name}
                          </span>
                          {m.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#D95D39]/10 text-[#D95D39] font-medium">
                              {m.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#736E65] dark:text-[#9E9990] mt-0.5 line-clamp-2">
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

        {/* Artifacts Pane Toggle Button */}
        {hasArtifacts && (
          <button
            onClick={onToggleArtifacts}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isArtifactsOpen
                ? 'bg-[#D95D39] text-white shadow-xs'
                : 'bg-white dark:bg-[#242321] hover:bg-[#F6F3ED] dark:hover:bg-[#2C2A28] border border-[#E2DCD2] dark:border-[#363430] text-[#1F1D1A] dark:text-[#EDEAE4]'
            }`}
            title="Toggle interactive Artifacts side panel"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Artifacts</span>
          </button>
        )}
      </div>
    </header>
  );
};
