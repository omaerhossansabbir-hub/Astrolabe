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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-[#0E0E11] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <AstrolabeLogo size={24} />
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Astrolabe Settings & Preferences
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'general'
                ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white font-semibold'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            General & Appearance
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'models'
                ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white font-semibold'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Default Model
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'custom'
                ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white font-semibold'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Custom Instructions
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'about'
                ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white font-semibold'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
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
                    { id: 'light', label: 'Light', icon: <Sun className="w-4 h-4 text-zinc-900" /> },
                    { id: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4 text-zinc-200" /> },
                    { id: 'system', label: 'System', icon: <Monitor className="w-4 h-4 text-zinc-500" /> },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() =>
                        setLocalSettings({ ...localSettings, theme: mode.id as any })
                      }
                      className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        localSettings.theme === mode.id
                          ? 'border-zinc-950 dark:border-white bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white ring-1 ring-zinc-950 dark:ring-white'
                          : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300'
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
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
                          ? 'border-zinc-950 dark:border-white bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white ring-1 ring-zinc-950 dark:ring-white'
                          : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Style Default */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
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
                          ? 'border-zinc-950 dark:border-white bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white ring-1 ring-zinc-950 dark:ring-white'
                          : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300'
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
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Extended Thinking by Default
                    </div>
                    <div className="text-[12px] text-zinc-500">
                      Astrolabe will perform deep step-by-step reasoning before complex answers.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.enableThinking}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, enableThinking: e.target.checked })
                    }
                    className="w-4 h-4 accent-zinc-950 dark:accent-white cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Audio Response Synthesis
                    </div>
                    <div className="text-[12px] text-zinc-500">
                      Enable text-to-speech speaker controls on messages.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.soundEnabled}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, soundEnabled: e.target.checked })
                    }
                    className="w-4 h-4 accent-zinc-950 dark:accent-white cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
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
                      ? 'border-zinc-950 dark:border-white bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-950 dark:ring-white'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850'
                  }`}
                >
                  <input
                    type="radio"
                    name="defaultModel"
                    checked={localSettings.defaultModel === model.id}
                    onChange={() => {}}
                    className="mt-1 accent-zinc-950 dark:accent-white"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                        {model.name}
                      </span>
                      {model.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold">
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                      {model.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                User Persona & Global Instructions
              </label>
              <p className="text-xs text-zinc-500">
                What would you like Astrolabe to know about you to provide tailored responses?
              </p>
              <textarea
                value={localSettings.customSystemPrompt}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, customSystemPrompt: e.target.value })
                }
                placeholder="e.g., I am a full-stack engineer and writer. When writing code, prefer modern TypeScript and clean architectural patterns. When speaking in Bengali, use rich vocabulary..."
                rows={6}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-950 dark:focus:border-white resize-none leading-relaxed text-xs sm:text-sm"
              />
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <AstrolabeLogo size={36} showText={true} />
              </div>

              <p>
                <strong className="text-zinc-900 dark:text-zinc-100">Astrolabe AI</strong> is a next-generation AI assistant built for deep intellect, creative nuance, and architectural clarity.
                Astrolabe brings real-time Artifacts, Projects, response style controls, and step-by-step thinking to your fingertips in a pristine monochrome environment.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <div className="text-[11px] font-semibold text-zinc-500 uppercase">Interactive Engine</div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">Astrolabe Artifacts v2</div>
                </div>
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <div className="text-[11px] font-semibold text-zinc-500 uppercase">Reasoning Backend</div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">Gemini 3.1 Flash (Server)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-semibold shadow-xs cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
