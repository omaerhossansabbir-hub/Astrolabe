import { ChatSession, Project, UserSettings } from '../types';

const CHATS_STORAGE_KEY = 'astrolabe_ai_chats_v3';
const PROJECTS_STORAGE_KEY = 'astrolabe_ai_projects_v3';
const SETTINGS_STORAGE_KEY = 'astrolabe_ai_settings_v3';
const ACTIVE_CHAT_KEY = 'astrolabe_ai_active_chat_id_v3';

const LEGACY_DEMO_PROJECT_IDS = new Set(['proj-bengali-lit', 'proj-web-dev']);
const LEGACY_DEMO_CHAT_IDS = new Set(['chat-welcome-astrolabe', 'chat-bangla-literature']);

export const DEFAULT_PROJECTS: Project[] = [];
export const DEFAULT_CHATS: ChatSession[] = [];

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  enableThinking: false,
  soundEnabled: true,
  defaultModel: 'astrolabe-3.5-sonnet',
  responseStyle: 'default',
  customSystemPrompt: '',
  language: 'auto',
};

export const getSavedChats = (): ChatSession[] => {
  try {
    const raw =
      localStorage.getItem(CHATS_STORAGE_KEY) ||
      localStorage.getItem('astrolabe_ai_chats_v2');
    if (!raw) return DEFAULT_CHATS;
    const parsed: ChatSession[] = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((c) => !LEGACY_DEMO_CHAT_IDS.has(c.id))
      : DEFAULT_CHATS;
  } catch {
    return DEFAULT_CHATS;
  }
};

export const saveChats = (chats: ChatSession[]) => {
  try {
    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
  } catch (e) {
    console.error('Error saving chats:', e);
  }
};

export const getSavedProjects = (): Project[] => {
  try {
    const raw =
      localStorage.getItem(PROJECTS_STORAGE_KEY) ||
      localStorage.getItem('astrolabe_ai_projects_v2');
    if (!raw) return DEFAULT_PROJECTS;
    const parsed: Project[] = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((p) => !LEGACY_DEMO_PROJECT_IDS.has(p.id))
      : DEFAULT_PROJECTS;
  } catch {
    return DEFAULT_PROJECTS;
  }
};

export const saveProjects = (projects: Project[]) => {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Error saving projects:', e);
  }
};

export const getSavedSettings = (): UserSettings => {
  try {
    const raw =
      localStorage.getItem(SETTINGS_STORAGE_KEY) ||
      localStorage.getItem('astrolabe_ai_settings_v2');
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    const { apiKey: _unused, ...rest } = parsed || {};
    return { ...DEFAULT_SETTINGS, ...rest };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: UserSettings) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
};

export const getActiveChatId = (): string | null => {
  const id = localStorage.getItem(ACTIVE_CHAT_KEY);
  if (!id || LEGACY_DEMO_CHAT_IDS.has(id)) return null;
  return id;
};

export const setActiveChatId = (id: string | null) => {
  if (!id) {
    localStorage.removeItem(ACTIVE_CHAT_KEY);
  } else {
    localStorage.setItem(ACTIVE_CHAT_KEY, id);
  }
};
