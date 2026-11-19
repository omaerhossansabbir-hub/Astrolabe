export type ArtifactType =
  | 'application/vnd.astrolabe.code'
  | 'image/svg+xml'
  | 'text/markdown'
  | 'application/vnd.astrolabe.diagram';

export interface AstrolabeArtifact {
  id: string;
  title: string;
  type: ArtifactType;
  language: string;
  content: string;
  version: number;
  createdAt: number;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  base64?: string;
  text?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  thinking?: string;
  thinkingTime?: number;
  attachments?: FileAttachment[];
  artifact?: AstrolabeArtifact;
  sources?: GroundingSource[];
  status?: 'sending' | 'streaming' | 'done' | 'error';
}

export interface ProjectFile {
  id: string;
  name: string;
  content: string;
  size: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  customInstructions: string;
  files: ProjectFile[];
  createdAt: number;
  color?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  projectId?: string;
  isPinned?: boolean;
  model: AstrolabeModel;
}

export type AstrolabeModel =
  | 'astrolabe-3.5-sonnet'
  | 'astrolabe-thinking'
  | 'astrolabe-3-opus'
  | 'astrolabe-3-haiku';

export interface ModelInfo {
  id: AstrolabeModel;
  name: string;
  tagline: string;
  description: string;
  badge?: string;
}

export const ASTROLABE_MODELS: ModelInfo[] = [
  {
    id: 'astrolabe-3.5-sonnet',
    name: 'Astrolabe 3.5 Sonnet',
    tagline: 'Flagship balanced intelligence',
    description: 'Fast, accurate, and articulate across coding, analysis, math, and Bengali/English conversation.',
    badge: 'Recommended',
  },
  {
    id: 'astrolabe-thinking',
    name: 'Astrolabe 3.7 Thinking',
    tagline: 'Deep step-by-step reasoning',
    description: 'Uses extended reasoning depth for complex logic, architecture, algorithms, and STEM problems.',
    badge: 'Deep Reason',
  },
  {
    id: 'astrolabe-3-opus',
    name: 'Astrolabe 3 Opus',
    tagline: 'Nuanced writing & research',
    description: 'Crafted for thorough research synthesis, essay composition, and nuanced multilingual prose.',
  },
  {
    id: 'astrolabe-3-haiku',
    name: 'Astrolabe 3 Haiku',
    tagline: 'Instant & lightweight',
    description: 'Ultra-low-latency answers for quick Q&A, translations, and rapid everyday tasks.',
  },
];

export type ResponseStyle = 'default' | 'concise' | 'explanatory' | 'formal' | 'creative';

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  enableThinking: boolean;
  soundEnabled: boolean;
  defaultModel: AstrolabeModel;
  responseStyle: ResponseStyle;
  customSystemPrompt: string;
  language: 'auto' | 'bn' | 'en';
}
