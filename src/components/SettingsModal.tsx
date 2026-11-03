import React, { useState } from 'react';
import {
  X,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { UserSettings, ASTROLABE_MODELS, ResponseStyle } from '../types';
import { AstrolabeLogo } from './AstrolabeLogo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'models' | 'custom' | 'about'>('general');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-[#201F1D] rounded-2xl border border-[#E2DCD2] dark:border-[#33302B] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2D7] dark:border-[#2F2D2A]">
          <div className="flex items-center gap-2">
            <AstrolabeLogo size={24} />
            <h2 className="text-base font-semibold text-[#1F1D1A] dark:text-[#EDEAE4]">
              Astrolabe Settings & Preferences
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E8980] hover:text-[#1F1D1A] dark:hover:text-[#EDEAE4] hover:bg-[#F2ECE3] dark:hover:bg-[#2B2926] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#E8E2D7] dark:border-[#2F2D2A] px-6 bg-[#FAF9F5] dark:bg-[#181817] text-xs font-medium">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'general'
                ? 'border-[#D95D39] text-[#D95D39] font-semibold'
                : 'border-transparent text-[#736E65] dark:text-[#9E9990] hover:text-[#1F1D1A]'
            }`}
          >
            General & Appearance
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'models'
                ? 'border-[#D95D39] text-[#D95D39] font-semibold'
                : 'border-transparent text-[#736E65] dark:text-[#9E9990] hover:text-[#1F1D1A]'
            }`}
          >
            Default Model
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'custom'
                ? 'border-[#D95D39] text-[#D95D39] font-semibold'
                : 'border-transparent text-[#736E65] dark:text-[#9E9990] hover:text-[#1F1D1A]'
            }`}
          >
            Custom Instructions
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'about'
                ? 'border-[#D95D39] text-[#D95D39] font-semibold'
                : 'border-transparent text-[#736E65] dark:text-[#9E9990] hover:text-[#1F1D1A]'
            }`}
          >
            About Astrolabe
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#736E65] dark:text-[#9E9990] mb-2.5">
                  Color Mode
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light', label: 'Warm Paper (Light)', icon: <Sun className="w-4 h-4 text-amber-500" /> },
                    { id: 'dark', label: 'Obsidian (Dark)', icon: <Moon className="w-4 h-4 text-indigo-400" /> },
                    { id: 'system', label: 'System Default', icon: <Monitor className="w-4 h-4 text-[#8E8980]" /> },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() =>
                        setLocalSettings({ ...localSettings, theme: mode.id as any })
                      }
                      className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        localSettings.theme === mode.id
                          ? 'border-[#D95D39] bg-[#FAF6EE] dark:bg-[#2C2A27] text-[#D95D39] ring-1 ring-[#D95D39]'
                          : 'border-[#E2DCD2] dark:border-[#363430] hover:bg-[#F9F6F0] dark:hover:bg-[#252422]'
                      }`}
                    >
                      {mode.icon}
                      <span>{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Default */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#736E65] dark:text-[#9E9990] mb-2">
                  Language Preference
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'auto', label: 'Auto Detect' },
                    { id: 'bn', label: 'বাংলা (Bengali)' },
                    { id: 'en', label: 'English' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() =>
                        setLocalSettings({ ...localSettings, language: lang.id as any })
                      }
                      className={`p-3 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                        localSettings.language === lang.id
                          ? 'border-[#D95D39] bg-[#FAF6EE] dark:bg-[#2C2A27] text-[#D95D39] ring-1 ring-[#D95D39]'
                          : 'border-[#E2DCD2] dark:border-[#363430] hover:bg-[#F9F6F0] dark:hover:bg-[#252422]'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Style Default */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#736E65] dark:text-[#9E9990] mb-2">
                  Default Response Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['default', 'concise', 'explanatory', 'creative'] as ResponseStyle[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setLocalSettings({ ...localSettings, responseStyle: st })}
                      className={`p-2.5 rounded-xl border text-xs font-medium capitalize text-center transition-all cursor-pointer ${
                        localSettings.responseStyle === st
                          ? 'border-[#D95D39] bg-[#FAF6EE] dark:bg-[#2C2A27] text-[#D95D39] ring-1 ring-[#D95D39]'
                          : 'border-[#E2DCD2] dark:border-[#363430] hover:bg-[#F9F6F0] dark:hover:bg-[#252422]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#1F1D1A] dark:text-[#EDEAE4]">
                      Extended Thinking by Default
                    </div>
                    <div className="text-[12px] text-[#8E8980]">
                      Astrolabe will perform deep step-by-step reasoning before complex answers.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.enableThinking}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, enableThinking: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#D95D39] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#1F1D1A] dark:text-[#EDEAE4]">
                      Audio Response Synthesis
                    </div>
                    <div className="text-[12px] text-[#8E8980]">
                      Enable text-to-speech speaker controls on messages.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.soundEnabled}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, soundEnabled: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#D95D39] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#736E65] dark:text-[#9E9990] mb-2">
                Select Default Intelligence Engine
              </label>

              {ASTROLABE_MODELS.map((model) => (
                <div
                  key={model.id}
                  onClick={() =>
                    setLocalSettings({ ...localSettings, defaultModel: model.id })
                  }
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    localSettings.defaultModel === model.id
                      ? 'border-[#D95D39] bg-[#FAF6EE] dark:bg-[#2C2A27] ring-1 ring-[#D95D39]'
                      : 'border-[#E2DCD2] dark:border-[#363430] hover:bg-[#F9F6F0] dark:hover:bg-[#252422]'
                  }`}
                >
                  <input
                    type="radio"
                    name="defaultModel"
                    checked={localSettings.defaultModel === model.id}
                    onChange={() => {}}
                    className="mt-1 accent-[#D95D39]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#1F1D1A] dark:text-[#EDEAE4]">
                        {model.name}
                      </span>
                      {model.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#D95D39]/10 text-[#D95D39] font-semibold">
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#736E65] dark:text-[#9E9990] mt-1">
                      {model.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#736E65] dark:text-[#9E9990]">
                User Persona & Global Instructions
              </label>
              <p className="text-xs text-[#8E8980]">
                What would you like Astrolabe to know about you to provide tailored responses?
              </p>
              <textarea
                value={localSettings.customSystemPrompt}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, customSystemPrompt: e.target.value })
                }
                placeholder="e.g., I am a full-stack engineer and Bengali writer. When writing code, prefer modern TypeScript and clean architectural patterns. When speaking in Bengali, use rich poetic vocabulary..."
                rows={6}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DED7CB] dark:border-[#383531] bg-[#FAF9F5] dark:bg-[#1A1918] text-[#1F1D1A] dark:text-[#EDEAE4] outline-none focus:border-[#D95D39] resize-none leading-relaxed text-xs sm:text-sm"
              />
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4 text-xs text-[#635F59] dark:text-[#A8A39A] leading-relaxed">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FAF6EE] dark:bg-[#252422] border border-[#E8E2D7] dark:border-[#33302B]">
                <AstrolabeLogo size={36} showText={true} />
              </div>

              <p>
                <strong>Astrolabe AI</strong> is a next-generation AI assistant built for deep intellect, creative nuance, and architectural clarity.
                Inspired by Claude’s serene interface, Astrolabe brings real-time Artifacts, Projects, response style controls, and step-by-step thinking to your fingertips.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-[#FAF9F5] dark:bg-[#1A1918] border border-[#E8E2D7] dark:border-[#33302B]">
                  <div className="text-[11px] font-semibold text-[#8E8980] uppercase">Interactive Engine</div>
                  <div className="font-semibold text-[#1F1D1A] dark:text-[#EDEAE4] mt-0.5">Astrolabe Artifacts v2</div>
                </div>
                <div className="p-3 rounded-lg bg-[#FAF9F5] dark:bg-[#1A1918] border border-[#E8E2D7] dark:border-[#33302B]">
                  <div className="text-[11px] font-semibold text-[#8E8980] uppercase">Reasoning Backend</div>
                  <div className="font-semibold text-[#1F1D1A] dark:text-[#EDEAE4] mt-0.5">Gemini 3.8 Flash (Server)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E8E2D7] dark:border-[#2F2D2A] bg-[#FAF9F5] dark:bg-[#181817]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#DED7CB] dark:border-[#383531] text-xs font-medium text-[#635F59] dark:text-[#A8A39A] hover:bg-[#F2ECE3] dark:hover:bg-[#2B2926] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#D95D39] hover:bg-[#C44F2C] text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
