import { ChatSession, Project, UserSettings, AstrolabeArtifact } from '../types';

const CHATS_STORAGE_KEY = 'astrolabe_ai_chats_v2';
const PROJECTS_STORAGE_KEY = 'astrolabe_ai_projects_v2';
const SETTINGS_STORAGE_KEY = 'astrolabe_ai_settings_v2';
const ACTIVE_CHAT_KEY = 'astrolabe_ai_active_chat_id';

const SAMPLE_ARTIFACT_HTML: AstrolabeArtifact = {
  id: 'art-sample-astrolabe-clock',
  title: 'Astrolabe Solar & Celestial Coordinate Navigator',
  type: 'application/vnd.astrolabe.code',
  language: 'html',
  version: 1,
  createdAt: Date.now() - 3600000,
  content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Astrolabe Celestial Engine</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: radial-gradient(circle at center, #1E1B18 0%, #0E0D0B 100%);
      color: #ede8df;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow: hidden;
    }
    .container {
      text-align: center;
      padding: 24px;
    }
    h1 {
      font-size: 1.6rem;
      font-weight: 400;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #D97706;
      margin-bottom: 6px;
    }
    p.sub {
      font-size: 0.85rem;
      color: #8c857b;
      margin-bottom: 24px;
    }
    .dial {
      position: relative;
      width: 290px;
      height: 290px;
      border-radius: 50%;
      border: 3px solid #854D0E;
      background: #141311;
      box-shadow: 0 0 50px rgba(217, 119, 6, 0.2), inset 0 0 35px rgba(0,0,0,0.85);
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ring {
      position: absolute;
      inset: 12px;
      border-radius: 50%;
      border: 1px dashed #A16207;
    }
    .alidade {
      position: absolute;
      width: 3px;
      height: 125px;
      background: linear-gradient(to top, transparent 0%, #D97706 60%, #FBBF24 100%);
      bottom: 50%;
      transform-origin: bottom center;
      transition: transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44);
    }
    .sun-orb {
      position: absolute;
      width: 16px;
      height: 16px;
      background: #FBBF24;
      border-radius: 50%;
      box-shadow: 0 0 16px #FBBF24;
      top: -8px;
      left: -6.5px;
    }
    .center-cap {
      position: absolute;
      width: 20px;
      height: 20px;
      background: #B45309;
      border-radius: 50%;
      border: 3px solid #141311;
      z-index: 10;
    }
    .time-readout {
      margin-top: 24px;
      font-size: 2.2rem;
      font-family: monospace;
      font-weight: 600;
      color: #faf9f5;
      letter-spacing: 0.05em;
    }
    .btn-row {
      margin-top: 18px;
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    button {
      background: #2a2825;
      color: #ede8df;
      border: 1px solid #4a453f;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
    }
    button:hover {
      background: #D97706;
      border-color: #D97706;
      color: white;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Astrolabe Celestial</h1>
    <p class="sub">Harmonic Solar Altitude & Latitude Navigator</p>
    <div class="dial">
      <div class="ring"></div>
      <div class="alidade" id="needle">
        <div class="sun-orb"></div>
      </div>
      <div class="center-cap"></div>
    </div>
    <div class="time-readout" id="clock">00:00:00</div>
    <div class="btn-row">
      <button onclick="toggleSpeed()">Celestial Fast Orbit</button>
      <button onclick="resetRealTime()">Sync Real Solar Time</button>
    </div>
  </div>
  <script>
    let fastMode = false;
    let fastSeconds = 0;
    function updateClock() {
      const now = new Date();
      let h = now.getHours();
      let m = now.getMinutes();
      let s = now.getSeconds();
      if (fastMode) {
        fastSeconds += 30;
        const total = (h * 3600 + m * 60 + s + fastSeconds) % 86400;
        h = Math.floor(total / 3600);
        m = Math.floor((total % 3600) / 60);
        s = total % 60;
      }
      const pad = (n) => String(n).padStart(2, '0');
      document.getElementById('clock').innerText = pad(h) + ':' + pad(m) + ':' + pad(s);
      const degrees = ((h % 12) * 30) + (m * 0.5) + (s * (0.5 / 60));
      document.getElementById('needle').style.transform = 'rotate(' + degrees + 'deg)';
    }
    setInterval(updateClock, 100);
    updateClock();
    function toggleSpeed() { fastMode = !fastMode; }
    function resetRealTime() { fastMode = false; fastSeconds = 0; }
  </script>
</body>
</html>`,
};

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-bengali-lit',
    name: 'বাংলা সাহিত্য ও দর্শন (Bengali Philosophy)',
    description: 'বাংলা সাহিত্য, চিন্তাশীল প্রবন্ধ ও কাব্যতাত্ত্বিক পর্যালোচনা প্রকল্প।',
    customInstructions: 'এই প্রজেক্টের সকল কথোপকথনে প্রমিত ও সমৃদ্ধ বাংলায় উত্তর প্রদান করো। সাহিত্যিক গভীরতা, চিন্তার স্বচ্ছতা ও মার্জিত ভাষা বজায় রাখো।',
    files: [
      {
        id: 'f-1',
        name: 'philosophy_guidelines.txt',
        content: 'দার্শনিক আলোচনা ও মননশীল সাহিত্যের জন্য প্রমিত বাংলা শব্দচয়ন এবং কাঠামোগত বিশ্লেষণ।',
        size: 1024,
      },
    ],
    createdAt: Date.now() - 86400000 * 2,
    color: '#D97706',
  },
  {
    id: 'proj-web-dev',
    name: 'Astrolabe Artifacts & Interactive Engineering',
    description: 'Modern front-end applications, interactive canvas games, and creative code artifacts.',
    customInstructions: 'When asked for UI or apps, create complete standalone interactive HTML/JS artifacts formatted with <astrolabeArtifact> tags.',
    files: [
      {
        id: 'f-2',
        name: 'tech-stack.md',
        content: 'Preferred stack: Clean HTML5, Modern CSS/Tailwind, JavaScript Canvas, SVG vectors, Mermaid charts.',
        size: 512,
      },
    ],
    createdAt: Date.now() - 86400000 * 5,
    color: '#6366F1',
  },
];

export const DEFAULT_CHATS: ChatSession[] = [
  {
    id: 'chat-welcome-astrolabe',
    title: 'Welcome to Astrolabe & Interactive Artifacts Demo',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
    isPinned: true,
    model: 'astrolabe-3.5-sonnet',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Create an interactive Astrolabe solar navigator as an interactive Artifact.',
        createdAt: Date.now() - 3600000,
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `I have designed and engineered an interactive **Astrolabe Solar & Celestial Coordinate Navigator**.

### Key Architectural Elements:
1. **Harmonic Astronomical Dial**: Concentric brass coordinate rings modeling celestial navigation.
2. **Alidade & Solar Needle**: Dynamic angle transformations computed using real-time solar hours.
3. **Simulation Engine**: Dual-mode engine with real solar time and accelerated celestial orbit.

You can inspect both the live executable preview and source code in the **Artifacts panel** on the right.`,
        createdAt: Date.now() - 3590000,
        thinking: '1. Designing an interactive aesthetic astrolabe combining antique celestial instruments with modern minimalist UI.\n2. Writing a self-contained HTML/CSS/JavaScript canvas and SVG solution with dual speed mode.\n3. Embedding within standard <astrolabeArtifact> format so Astrolabe splits the screen automatically.',
        thinkingTime: 3.2,
        artifact: SAMPLE_ARTIFACT_HTML,
        status: 'done',
      },
    ],
  },
  {
    id: 'chat-bengali-sample',
    title: 'বাংলায় মননশীল আলোচনা ও সাহিত্য',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    projectId: 'proj-bengali-lit',
    model: 'astrolabe-3.5-sonnet',
    messages: [
      {
        id: 'msg-b1',
        role: 'user',
        content: 'অ্যাস্ট্রো ল্যাব (Astrolabe), আধুনিক জীবনে মানুষের আত্মিক একাগ্রতা ও মননশীলতা নিয়ে বাংলায় একটি চিন্তাশীল লেখা লেখো।',
        createdAt: Date.now() - 86400000,
      },
      {
        id: 'msg-b2',
        role: 'assistant',
        content: `স্বাগতম। প্রাচীন যুগে যেমন নাবিকেরা দিক নির্ণয়ের জন্য 'অ্যাস্ট্রো ল্যাব' (Astrolabe)-এর উপর নির্ভর করতেন, তেমনই জ্ঞানের এই বিশাল সমুদ্রে সঠিক দিশা পাওয়ার জন্য প্রয়োজন গভীর মননশীলতা।

### দিকনির্ণয়ের যন্ত্র ও আধুনিক মানুষের মন

তথ্যপ্রযুক্তির এই বিপুল প্লাবনের যুগে মানুষের সবচেয়ে দুর্লভ সম্পদ হয়ে উঠেছে **'মনোযোগ' (Deep Focus)**। আমরা প্রতিনিয়ত হাজারো তরঙ্গের মাঝে ভেসে যাচ্ছি, অথচ তলিয়ে দেখার অবকাশ পাচ্ছি না।

> *"যে চিন্তা নিভৃতে শিকড় বিস্তার করে না, তা কখনো বিশাল মহীরুহে পরিণত হতে পারে না।"*

#### তিনটি মৌলিক সত্য:
1. **চিন্তার শুচিতা (Intellectual Purity):** তথ্যের প্রাচুর্য মানেই জ্ঞানের বিকাশ নয়; গভীর বিশ্লেষণই সত্যকে স্পর্শ করতে পারে।
2. **ধৈর্যশীল সংলাপে আত্মবিকাশ:** তাড়াহুড়ো নয়, যুক্তি ও অনুভবের সমন্বয়ে যখন সংলাপ রচিত হয়, তখন জ্ঞানের বিস্তার ঘটে।
3. **দিকনির্ণায়ক দিশা (The Astrolabe Principle):** বাইরের অস্থিরতা যতই বাড়ুক, নিজের ভেতরের নীতি ও প্রজ্ঞার ধ্রুবতারা অনুসরণ করাই প্রকৃত সাফল্য।

Astrolabe কেবল উত্তর দেওয়ার যন্ত্র নয়, বরং চিন্তাকে শাণিত করার এক বিশ্বস্ত সঙ্গী। আপনি কোন বিষয়ে আরও গভীর আলোচনা করতে চান?`,
        createdAt: Date.now() - 86390000,
        status: 'done',
      },
    ],
  },
];

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  enableThinking: true,
  soundEnabled: true,
  defaultModel: 'astrolabe-3.5-sonnet',
  responseStyle: 'default',
  customSystemPrompt: '',
  language: 'auto',
};

export const getSavedChats = (): ChatSession[] => {
  try {
    const raw = localStorage.getItem(CHATS_STORAGE_KEY) || localStorage.getItem('castle_ai_chats_v1');
    if (!raw) return DEFAULT_CHATS;
    return JSON.parse(raw);
  } catch (e) {
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
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY) || localStorage.getItem('castle_ai_projects_v1');
    if (!raw) return DEFAULT_PROJECTS;
    return JSON.parse(raw);
  } catch (e) {
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
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY) || localStorage.getItem('castle_ai_settings_v1');
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
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

export const getActiveChatId = (): string => {
  return localStorage.getItem(ACTIVE_CHAT_KEY) || 'chat-welcome-astrolabe';
};

export const setActiveChatId = (id: string) => {
  localStorage.setItem(ACTIVE_CHAT_KEY, id);
};
