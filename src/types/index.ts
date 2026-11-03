export type ArtifactType = 'application/vnd.astrolabe.code' | 'image/svg+xml' | 'text/markdown' | 'application/vnd.astrolabe.diagram';

export interface AstrolabeArtifact {
  id: string;
  title: string;
  type: ArtifactType;
  language: string;
  content: string;
  version: number;
  createdAt: number;
}

// Backward compatibility alias
export type CastleArtifact = AstrolabeArtifact;

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  base64?: string;
  text?: string;
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
  | 'astrolabe-3-opus'
  | 'astrolabe-3-haiku'
  | 'astrolabe-thinking';

export type CastleModel = AstrolabeModel;

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
    tagline: 'Most intelligent & articulate model',
    description: 'Ideal for complex reasoning, rapid coding, creative writing, and high-fidelity artifacts.',
    badge: 'Recommended',
  },
  {
    id: 'astrolabe-thinking',
    name: 'Astrolabe 3.7 Thinking',
    tagline: 'Extended chain-of-thought reasoning',
    description: 'Shows step-by-step analytical reasoning before producing solutions. Best for math, algorithms, and deep analysis.',
    badge: 'Extended Thinking',
  },
  {
    id: 'astrolabe-3-opus',
    name: 'Astrolabe 3 Opus',
    tagline: 'Highest nuance & deep synthesis',
    description: 'Excels at complex academic research, philosophical dialogue, and nuanced literary Bengali/English writing.',
  },
  {
    id: 'astrolabe-3-haiku',
    name: 'Astrolabe 3 Haiku',
    tagline: 'Ultra-fast & lightweight',
    description: 'Near-instant responses for quick questions, translations, summaries, and edits.',
  },
];

export const CASTLE_MODELS = ASTROLABE_MODELS;

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
