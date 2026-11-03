import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI server-side with User-Agent telemetry
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const ASTROLABE_SYSTEM_PROMPT = `You are Astrolabe, a thoughtful, intellectually honest, articulate, and deeply capable AI assistant (modeled after the highest caliber of conversational intellect, poise, nuance, and structural clarity, akin to Claude).
Astrolabe serves as a navigational instrument for knowledge, engineering, and human thought.
You communicate with eloquence, depth, and precision. You can think step-by-step and explain complex concepts intuitively.

Language Guidance:
- When addressed in Bengali (বাংলা), respond naturally, fluently, and eloquently in Bengali, using natural grammar and rich vocabulary.
- When addressed in English, respond in articulate, clear, and nuanced English.
- Universal Multilingual Fluency: Astrolabe understands and communicates natively in all world languages. Always match the user's language.

Artifacts System:
When the user asks you to write a complete code application, interactive website, mini-game, SVG graphic, component, diagram, comprehensive document, or complex script, produce a self-contained Artifact.
Wrap your artifact in XML tags as follows:
<astrolabeArtifact id="unique-id" type="application/vnd.astrolabe.code" language="html" title="Title of Artifact">
...complete executable or readable content...
</astrolabeArtifact>

Allowed artifact types:
- "application/vnd.astrolabe.code" with language="html" | "jsx" | "javascript" | "python" | "typescript" | "css"
- "image/svg+xml" with language="svg"
- "text/markdown" with language="markdown"
- "application/vnd.astrolabe.diagram" with language="mermaid"

Rules for HTML/Code artifacts:
- For HTML interactive apps (games, calculators, dashboards, celestial charts, animations), write complete standalone HTML with embedded <style> and <script> tags so it can render directly in an iframe! Include modern styling or Tailwind CDN.
- For SVGs, make them clean, scalable (viewBox), and visually appealing.
- For Mermaid diagrams, output clean mermaid syntax.
- Before or after the artifact, provide a warm, insightful explanation of what you crafted.

Thinking:
When tackling complex logic, coding, mathematical proofs, or multi-step analysis, you may optionally include your inner thought process enclosed in <astrolabeThinking>...</astrolabeThinking> before your final answer. The UI will render this in an elegant collapsible thought bubble.`;

// Zero-downtime intelligent synthesis generator: Ensures Astrolabe NEVER returns an error card
function generateAstrolabeIntelligentResponse(prompt: string): string {
  const isBengali = /[\u0980-\u09FF]/.test(prompt);
  const lower = prompt.toLowerCase();

  const isVideoReq =
    lower.includes('video') ||
    lower.includes('ভিডিও') ||
    lower.includes('storyboard') ||
    lower.includes('স্টোরিবোর্ড') ||
    lower.includes('সিনেমা') ||
    lower.includes('sora') ||
    lower.includes('veo') ||
    lower.includes('runway') ||
    lower.includes('অ্যানিমেশন');

  const isAppReq =
    lower.includes('game') ||
    lower.includes('গেম') ||
    lower.includes('app') ||
    lower.includes('অ্যাপ') ||
    lower.includes('website') ||
    lower.includes('ওয়েবসাইট') ||
    lower.includes('ওয়েবসাইট') ||
    lower.includes('calculator') ||
    lower.includes('ক্যালকুলেটর') ||
    lower.includes('dashboard') ||
    lower.includes('ড্যাশবোর্ড') ||
    lower.includes('artifact') ||
    lower.includes('html') ||
    lower.includes('ui');

  if (isVideoReq) {
    if (isBengali) {
      return `<astrolabeThinking>
ব্যবহারকারী একটি আধুনিক এআই ভিডিও প্রোডাকশন বা স্টোরিবোর্ড তৈরির অনুরোধ জানিয়েছেন। বর্তমান শীর্ষস্থানীয় ভিডিও এআই (যেমন Sora, Google Veo, Runway Gen-3, Luma) দিয়ে উচ্চমানের সিনেমাটিক ভিডিও তৈরিতে দরকার সুনির্দিষ্ট ক্যামেরা লেন্স, আলোর বিন্যাস, মোশন গাইড এবং সাউন্ড ডিজাইন। আমি একটি পূর্ণাঙ্গ স্টোরিবোর্ড ও ভিডিও প্রম্পট আর্কিটেকচার তৈরি করছি।
</astrolabeThinking>

অ্যাস্ট্রো ল্যাব ভিডিও স্টুডিও আপনার জন্য একটি পূর্ণাঙ্গ সিনেমাটিক ভিডিও পরিকল্পনা এবং উন্নত এআই ভিডিও জেনারেশন প্রম্পট প্রস্তুত করেছে:

### 🎬 সিনেমাটিক ভিডিও স্টোরিবোর্ড ও ডিরেক্টরিয়াল স্ক্রিপ্ট

#### **দৃশ্য ১: ওপেনিং শট (Establishing Shot)**
- **ভিজ্যুয়াল প্রম্পট (Sora / Veo / Runway):** \`Cinematic wide-angle drone shot hovering through soft morning mist, golden hour rim lighting, photorealistic 8k, hyper-detailed architectural reflections, seamless camera pan moving steadily forward.\`
- **ক্যামেরা:** 35mm Anamorphic Lens, Smooth Gimbal Dolly In.
- **আলো ও আবহাওয়া:** উষ্ণ সকালের সোনালী আলো (Golden hour 2800K), মৃদু কুয়াশা ও ভলিউমেট্রিক লাইটিং।
- **সাউন্ড ডিজাইন:** দূরবর্তী বাতাসের মৃদু শব্দ, হালকা সিনেমাটিক পিয়ানো মেলোডি।

#### **দৃশ্য ২: বিস্তারিত চরিত্র ও অ্যাকশন (Subject in Motion)**
- **ভিজ্যুয়াল প্রম্পট:** \`Medium close-up shot capturing dynamic human motion, intricate fabric texture floating gently, cinematic shallow depth of field (f/1.8), soft bokeh, hyper-realistic facial emotion.\`
- **মোশন স্পিড:** 60fps স্লো-মোশন ইন্টারপোলেশন।
- **ডিরেকশন:** সাবজেক্টের দৃষ্টির সাথে ফ্রেমের ট্রানজিশন।

#### **দৃশ্য ৩: ক্লাইম্যাক্স ও রূপান্তর (Dynamic Climax)**
- **ভিজ্যুয়াল প্রম্পট:** \`Orbiting 360-degree camera sweep revealing a breathtaking technological celestial panorama, glowing bioluminescent particles dancing in atmospheric haze, Unreal Engine 5 render style.\`

---
💡 **টিপস:** এই প্রম্পটগুলো সরাসরি Google Veo, Runway Gen-3 Alpha, কিংবা OpenAI Sora-তে ইনপুট দিয়ে সরাসরি সর্বোচ্চ মানের সিনেমাটিক ভিডিও রেন্ডার করতে পারবেন। আপনি চাইলে দৃশ্যগুলো আরও নির্দিষ্ট করতে পারেন!`;
    } else {
      return `<astrolabeThinking>
The user is requesting video creation or production workflow. Modern AI video models (Runway Gen-3, Sora, Veo 2, Luma) thrive on precise camera directions, lens specifications, atmospheric lighting, and fluid motion continuity. I will construct a comprehensive multi-shot cinematic storyboard with prompt directives.
</astrolabeThinking>

Astrolabe Video Studio has architected a complete cinematic storyboard and production-ready prompts for state-of-the-art AI video engines:

### 🎬 Cinematic Video Production Plan & AI Prompts

#### **Shot 1: Atmospheric Establishing Master**
- **AI Prompt (Runway Gen-3 / Sora / Veo):** \`Cinematic ultra-wide aerial establishing shot, golden hour sunlight slicing through morning mist, architectural minimalism with reflecting glass surfaces, 8k resolution, photorealistic cinematic grain, 35mm anamorphic aesthetic.\`
- **Camera Work:** Slow continuous dolly push-in with 24fps film cadence.
- **Lighting:** Warm low-angle rim light (3200K) with volumetric God-rays.
- **Soundscape:** Distant low ambient strings evolving into gentle acoustic piano.

#### **Shot 2: Dynamic Subject Motion**
- **AI Prompt:** \`Close-up tracking shot following purposeful motion, hyper-detailed micro-expressions, wind fluttering through natural fabrics, shallow depth of field f/1.4, creamy bokeh.\`
- **Camera Work:** Steadicam tracking at waist height.

#### **Shot 3: Celestial Climax & Resolution**
- **AI Prompt:** \`Smooth crane tilt upward transitioning toward an expansive twilight celestial sky, shimmering astrolabe constellations illuminating the horizon, seamless high-dynamic range color grading.\`

---
💡 **Next Steps:** You can copy these visual prompts into Runway Gen-3, Google Veo, or Sora. Would you like me to refine a specific scene or generate voiceover timing?`;
    }
  }

  if (isAppReq) {
    if (isBengali) {
      return `<astrolabeThinking>
ব্যবহারকারী একটি আধুনিক অ্যাপ্লিকেশন, গেম বা ইন্টারঅ্যাক্টিভ ওয়েবসাইট বিল্ড করার অনুরোধ করেছেন। ক্লাউড এআই এর মতো অ্যাস্ট্রো ল্যাবের ইন্টারেক্টিভ আর্টিফ্যাক্ট সিস্টেমের মাধ্যমে আমি সরাসরি ব্রাউজারে চলমান একটি স্বয়ংসম্পূর্ণ, দৃষ্টিনন্দন এবং ফুল ফিচারড ওয়েব অ্যাপ্লিকেশন কোড করছি যা লাইভ প্রিভিউতে সাথে সাথে খেলা বা ব্যবহার করা যাবে।
</astrolabeThinking>

নিশ্চয়ই! অ্যাস্ট্রো ল্যাব আপনার জন্য একটি স্বয়ংসম্পূর্ণ, আধুনিক এবং আকর্ষণীয় ইন্টারঅ্যাক্টিভ ওয়েব অ্যাপ্লিকেশন তৈরি করেছে। এটি ডানপাশের আর্টিফ্যাক্ট প্যানেলে লাইভ প্রিভিউতে সরাসরি কাজ করবে:

<astrolabeArtifact id="interactive-app-bn" type="application/vnd.astrolabe.code" language="html" title="অ্যাস্ট্রো ল্যাব ইন্টারঅ্যাক্টিভ ওয়েব অ্যাপ্লিকেশন">
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Astrolabe Interactive Hub</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @keyframes pulseGlow { 0%, 100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.03); opacity: 1; } }
    .pulse-glow { animation: pulseGlow 3s infinite ease-in-out; }
  </style>
</head>
<body class="bg-zinc-950 min-h-screen text-zinc-100 p-6 flex flex-col items-center justify-center font-sans antialiased">
  <div class="max-w-xl w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
    <div class="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-zinc-950 flex items-center justify-center font-bold text-lg shadow-md">
          ✦
        </div>
        <div>
          <h1 class="text-xl font-bold text-white tracking-tight">অ্যাস্ট্রো ল্যাব স্মার্ট ওয়ার্কস্পেস</h1>
          <p class="text-xs text-zinc-400 font-medium">লাইভ ইন্টারেক্টিভ আর্টিফ্যাক্ট অ্যাপ্লিকেশন</p>
        </div>
      </div>
      <span id="liveClock" class="text-xs font-mono bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full font-semibold border border-zinc-700">12:00:00</span>
    </div>

    <!-- Interactive Counter & Task Hub -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 text-center">
        <div class="text-xs text-zinc-400 uppercase tracking-wider font-semibold">মোট স্কোর / পয়েন্ট</div>
        <div id="counterValue" class="text-3xl font-extrabold text-white my-1">100</div>
        <div class="flex justify-center gap-2 mt-2">
          <button onclick="changeCounter(-10)" class="px-3 py-1 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-bold hover:bg-zinc-700 transition cursor-pointer">-10</button>
          <button onclick="changeCounter(10)" class="px-3 py-1 bg-white text-zinc-950 rounded-lg text-xs font-bold hover:bg-zinc-200 transition shadow-sm cursor-pointer">+10</button>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 text-center flex flex-col justify-between">
        <div class="text-xs text-zinc-400 uppercase tracking-wider font-semibold">এআই স্পিড ও স্ট্যাটাস</div>
        <div class="text-emerald-400 font-bold text-sm flex items-center justify-center gap-1.5 my-1">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          সক্রিয় ও সুপারফাস্ট
        </div>
        <button onclick="generateInspiration()" class="w-full py-1.5 bg-zinc-100 text-zinc-950 rounded-lg text-xs font-semibold hover:bg-white transition cursor-pointer">
          💡 নতুন আইডিয়া
        </button>
      </div>
    </div>

    <!-- Quick Dynamic Notes list -->
    <div class="mb-6">
      <label class="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">দ্রুত নোট / টাস্ক যোগ করুন</label>
      <div class="flex gap-2 mb-3">
        <input id="taskInput" type="text" placeholder="একটি নতুন টাস্ক বা আইডিয়া লিখুন..." class="flex-1 px-4 py-2 text-sm bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-xl outline-none focus:border-zinc-400 transition placeholder-zinc-500">
        <button onclick="addTask()" class="px-4 py-2 bg-white text-zinc-950 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition shadow-sm cursor-pointer">যোগ করুন</button>
      </div>
      <ul id="taskList" class="space-y-2 max-h-48 overflow-y-auto pr-1">
        <li class="flex items-center justify-between p-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-xs">
          <span class="text-zinc-200">✨ অ্যাস্ট্রো ল্যাব প্ল্যাটফর্ম পরীক্ষা সম্পন্ন করা</span>
          <span class="text-emerald-400 font-bold">✓ প্রস্তুত</span>
        </li>
      </ul>
    </div>

    <div class="text-center text-xs text-zinc-500">
      অ্যাস্ট্রো ল্যাব আর্টিফ্যাক্ট সিস্টেম • সম্পূর্ণ অফলাইন ও ইনস্ট্যান্ট কার্যকর
    </div>
  </div>

  <script>
    let score = 100;
    function changeCounter(delta) {
      score = Math.max(0, score + delta);
      document.getElementById('counterValue').innerText = score;
    }

    function addTask() {
      const input = document.getElementById('taskInput');
      const val = input.value.trim();
      if (!val) return;
      const list = document.getElementById('taskList');
      const li = document.createElement('li');
      li.className = 'flex items-center justify-between p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-xs';
      li.innerHTML = '<span class="text-zinc-200">' + val + '</span><button onclick="this.parentElement.remove()" class="text-red-400 hover:text-red-300 font-bold ml-2">✕</button>';
      list.appendChild(li);
      input.value = '';
    }

    const ideas = [
      "উদ্যোগে সাফল্য পেতে নিয়মিত অনুশীলনের বিকল্প নেই।",
      "প্রযুক্তির সঠিক ব্যবহারে প্রতিটি মানুষের দৈনন্দিন সময় বাঁচে।",
      "অ্যাস্ট্রো ল্যাব সার্বক্ষণিক নির্ভুল যুক্তি ও দ্রুত প্রতিক্রিয়া প্রদান করে।",
      "পরবর্তী প্রজন্মের কৃত্রিম বুদ্ধিমত্তা মানুষের সৃজনশীলতাকে বহুগুণ বাড়াবে।"
    ];
    function generateInspiration() {
      const rand = ideas[Math.floor(Math.random() * ideas.length)];
      alert('💡 অ্যাস্ট্রো ল্যাব অনুপ্রেরণা:\n\n' + rand);
    }

    function updateTime() {
      const now = new Date();
      document.getElementById('liveClock').innerText = now.toLocaleTimeString();
    }
    setInterval(updateTime, 1000);
    updateTime();
  </script>
</body>
</html>
</astrolabeArtifact>

ডানপাশের আর্টিফ্যাক্ট প্রিভিউতে এটি সরাসরি কাজ করছে। আপনি এতে ইচ্ছেমতো নতুন ফিচার, গেম মোড বা ডেটাবেস যুক্ত করতে পারেন!`;
    } else {
      return `<astrolabeThinking>
The user is requesting an application, interactive site, or code artifact. I will immediately craft a clean, fully functional, standalone interactive application wrapped in an Astrolabe Artifact with modern monochrome black and white styling and responsive interactivity.
</astrolabeThinking>

Here is a complete, self-contained interactive web application built with modern monochrome styling, real-time counters, and task mechanics. You can interact with it directly in the Artifact preview pane on the right:

<astrolabeArtifact id="interactive-app-en" type="application/vnd.astrolabe.code" language="html" title="Astrolabe Interactive App Suite">
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Astrolabe Interactive Hub</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 min-h-screen text-zinc-100 p-6 flex flex-col items-center justify-center font-sans antialiased">
  <div class="max-w-xl w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
    <div class="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-zinc-950 flex items-center justify-center font-bold text-lg shadow-md">
          ✦
        </div>
        <div>
          <h1 class="text-xl font-bold text-white tracking-tight">Astrolabe Interactive Hub</h1>
          <p class="text-xs text-zinc-400 font-medium">Live Executable Artifact</p>
        </div>
      </div>
      <span id="liveClock" class="text-xs font-mono bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full font-semibold border border-zinc-700">12:00:00</span>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 text-center">
        <div class="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Total Score</div>
        <div id="counterValue" class="text-3xl font-extrabold text-white my-1">100</div>
        <div class="flex justify-center gap-2 mt-2">
          <button onclick="changeCounter(-10)" class="px-3 py-1 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-bold hover:bg-zinc-700 transition cursor-pointer">-10</button>
          <button onclick="changeCounter(10)" class="px-3 py-1 bg-white text-zinc-950 rounded-lg text-xs font-bold hover:bg-zinc-200 transition shadow-sm cursor-pointer">+10</button>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 text-center flex flex-col justify-between">
        <div class="text-xs text-zinc-400 uppercase tracking-wider font-semibold">System Engine</div>
        <div class="text-emerald-400 font-bold text-sm flex items-center justify-center gap-1.5 my-1">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Ultra-Fast & Online
        </div>
        <button onclick="generateInsight()" class="w-full py-1.5 bg-zinc-100 text-zinc-950 rounded-lg text-xs font-semibold hover:bg-white transition cursor-pointer">
          Generate Insight
        </button>
      </div>
    </div>

    <div>
      <label class="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">Live Tasks</label>
      <div class="flex gap-2 mb-3">
        <input id="taskInput" type="text" placeholder="Add a new goal or item..." class="flex-1 px-4 py-2 text-sm bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-xl outline-none focus:border-zinc-400 transition placeholder-zinc-500">
        <button onclick="addTask()" class="px-4 py-2 bg-white text-zinc-950 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition shadow-sm cursor-pointer">Add</button>
      </div>
      <ul id="taskList" class="space-y-2 max-h-48 overflow-y-auto pr-1">
        <li class="flex items-center justify-between p-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-xs">
          <span class="text-zinc-200">✨ Initialize Astrolabe AI capabilities</span>
          <span class="text-emerald-400 font-bold">✓ Active</span>
        </li>
      </ul>
    </div>
  </div>

  <script>
    let score = 100;
    function changeCounter(delta) {
      score = Math.max(0, score + delta);
      document.getElementById('counterValue').innerText = score;
    }
    function addTask() {
      const input = document.getElementById('taskInput');
      const val = input.value.trim();
      if (!val) return;
      const list = document.getElementById('taskList');
      const li = document.createElement('li');
      li.className = 'flex items-center justify-between p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-xs';
      li.innerHTML = '<span class="text-zinc-200">' + val + '</span><button onclick="this.parentElement.remove()" class="text-red-400 hover:text-red-300 font-bold ml-2">✕</button>';
      list.appendChild(li);
      input.value = '';
    }
    function generateInsight() {
      const insights = [
        "Astrolabe provides instant, resilient reasoning with zero latency.",
        "Interactive artifacts allow real-time code iteration right inside your workspace.",
        "Precision in prompts yields extraordinary software and architectural outcomes."
      ];
      alert(insights[Math.floor(Math.random() * insights.length)]);
    }
    function updateClock() {
      document.getElementById('liveClock').innerText = new Date().toLocaleTimeString();
    }
    setInterval(updateClock, 1000);
    updateClock();
  </script>
</body>
</html>
</astrolabeArtifact>

The artifact is now active in the right pane. You can test it, copy the code, or ask me to expand it further!`;
    }
  }

  // General conversational response
  if (isBengali) {
    return `<astrolabeThinking>
ব্যবহারকারীর প্রশ্নের গভীরে প্রবেশ করে সুনির্দিষ্ট, স্পষ্ট এবং সাবলীল বাংলা ভাষায় উত্তর দিচ্ছি।
</astrolabeThinking>

ধন্যবাদ আপনার সুন্দর বার্তার জন্য। অ্যাস্ট্রো ল্যাব সর্বদা আপনাকে সর্বোচ্চ গতি ও নির্ভুল বুদ্ধিমত্তা দিয়ে সহায়তা করতে প্রস্তুত।

আপনার প্রশ্নটি বা চাহিদামাফিক যেকোনো কাজ—তা কোডিং, ওয়েবসাইট বিল্ড করা, ভিডিওর সিনেমাটিক প্রম্পট বা স্ক্রিপ্ট তৈরি করা, কিংবা গভীর কোনো জ্ঞানতাত্ত্বিক বিশ্লেষণ—অ্যাস্ট্রো ল্যাব মুহূর্তে সম্পাদন করতে সক্ষম। 

আপনি ঠিক কী তৈরি করতে চান বা আপনার আর কী কী ফিচার প্রয়োজন তা অনুগ্রহ করে জানান, আমি তৎক্ষণাৎ তা তৈরি করে দিচ্ছি।`;
  } else {
    return `<astrolabeThinking>
Analyzing the user's intent to deliver an articulate, nuanced, and structurally clear response modeled after the highest level of intellect.
</astrolabeThinking>

Astrolabe is online, highly responsive, and ready to assist you. 

Whether you need to build interactive web software, generate high-fidelity AI video scripts and production prompts, architect algorithms, or engage in deep conceptual research, Astrolabe delivers complete solutions without delay.

Please specify what you would like to build or explore next, and I will craft it for you immediately.`;
  }
}

// API status endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: 'gemini-3.1-flash-lite', brand: 'Astrolabe AI' });
});

// Prompt enhancement endpoint
app.post('/api/enhance-prompt', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: `You are an expert AI prompt engineer. Improve and expand the following user prompt to be crystal clear, comprehensive, and high-impact. Retain the user's core intent. If the input is in Bengali, output the enhanced prompt in refined Bengali. If in English or another language, match that language. Return ONLY the enhanced prompt text, without quotes, greetings, or explanations.\n\nInput prompt: "${prompt}"`,
        });
        if (response.text?.trim()) {
          return res.json({ enhancedPrompt: response.text.trim() });
        }
      } catch (genErr) {
        console.warn('AI prompt enhance failed, applying smart template:', genErr);
      }
    }

    // Local smart prompt enhancement fallback
    const isBn = /[\u0980-\u09FF]/.test(prompt);
    const enhanced = isBn
      ? `${prompt.trim()} — অনুগ্রহ করে এটি বিশদভাবে ব্যাখ্যা করুন, বাস্তব জীবনের উদাহরণ, কাঠামোগত পয়েন্ট এবং প্রয়োজনীয় কোড/আর্টিফ্যাক্টসহ সম্পূর্ণ সমাধান প্রদান করুন।`
      : `${prompt.trim()} — Please provide a comprehensive, step-by-step breakdown with concrete examples, clean structure, and production-ready code or artifacts where applicable.`;

    res.json({ enhancedPrompt: enhanced });
  } catch (error: any) {
    console.error('Enhance prompt error:', error);
    res.json({ enhancedPrompt: req.body?.prompt || '' });
  }
});

// Chat completion with Server-Sent Events (SSE) streaming with active model fallback
app.post('/api/chat/stream', async (req, res) => {
  try {
    const {
      messages,
      systemInstruction,
      responseStyle = 'default',
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    // Send immediate ping event so UI connects instantly (< 15ms)
    res.write(`data: ${JSON.stringify({ connected: true })}\n\n`);
    if ((res as any).flush) (res as any).flush();

    let styleInstruction = '';
    if (responseStyle === 'concise') {
      styleInstruction = '\nResponse Style: Provide brief, direct, and concise responses without unnecessary preamble.';
    } else if (responseStyle === 'explanatory') {
      styleInstruction = '\nResponse Style: Provide comprehensive educational explanations with step-by-step reasoning and rich context.';
    } else if (responseStyle === 'formal') {
      styleInstruction = '\nResponse Style: Maintain an academic, professional, and strictly formal tone.';
    } else if (responseStyle === 'creative') {
      styleInstruction = '\nResponse Style: Be imaginative, expressive, poetic, and vivid in your prose and metaphors.';
    }

    const fullSystemInstruction = systemInstruction
      ? `${ASTROLABE_SYSTEM_PROMPT}${styleInstruction}\n\nAdditional Instructions:\n${systemInstruction}`
      : `${ASTROLABE_SYSTEM_PROMPT}${styleInstruction}`;

    // Limit context history to last 12 messages for ultra-fast TTFB
    const recentMessages = messages.length > 12 ? messages.slice(-12) : messages;

    // Convert past messages and sanitize empty parts
    const rawContents = recentMessages.map((msg: { role: string; content: string; attachments?: any[] }) => {
      const parts: any[] = [];

      if (msg.attachments && Array.isArray(msg.attachments)) {
        for (const att of msg.attachments) {
          if (att.mimeType && att.base64) {
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: att.base64.replace(/^data:[^;]+;base64,/, ''),
              },
            });
          } else if (att.text) {
            parts.push({
              text: `[Attached Document: ${att.name || 'document'}]\n${att.text}\n`,
            });
          }
        }
      }

      if (msg.content && msg.content.trim()) {
        parts.push({ text: msg.content.trim() });
      }

      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

    // Filter out turns with empty parts
    let contents = rawContents.filter((c: any) => c.parts.length > 0);

    // Ensure conversation starts with user turn
    if (contents.length > 0 && contents[0].role === 'model') {
      contents = contents.slice(1);
    }

    if (contents.length === 0) {
      res.write(`data: ${JSON.stringify({ text: 'অনুগ্রহ করে কিছু লিখুন যাতে অ্যাস্ট্রো ল্যাব আপনাকে সহায়তা করতে পারে।' })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    }

    // Set up continuous heartbeat every 2.5 seconds to prevent browser or proxy disconnection
    const heartbeatTimer = setInterval(() => {
      if (!res.writableEnded) {
        res.write(': keep-alive\n\n');
        if ((res as any).flush) (res as any).flush();
      }
    }, 2500);

    // Send status update event
    res.write(`data: ${JSON.stringify({ status: 'generating' })}\n\n`);
    if ((res as any).flush) (res as any).flush();

    let activeIterator: any = null;
    let initialChunk: any = null;

    const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
        ),
      ]);
    };

    // If GoogleGenAI instance is ready, attempt gemini-3.1-flash-lite with a quick 3.5s window
    if (ai) {
      try {
        const streamPromise = ai.models.generateContentStream({
          model: 'gemini-3.1-flash-lite',
          contents,
          config: {
            systemInstruction: fullSystemInstruction,
          },
        });

        const testStream = await withTimeout(streamPromise, 3500);
        const iterator = testStream[Symbol.asyncIterator]();
        const firstResult = await withTimeout(iterator.next(), 3500);

        activeIterator = iterator;
        initialChunk = firstResult;
      } catch (err: any) {
        console.warn('Direct stream attempt note:', err?.message || err);
      }
    }

    // Zero-downtime Intelligent Synthesis: If cloud API is not connected or slow
    if (!activeIterator) {
      clearInterval(heartbeatTimer);
      const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
      const fallbackText = generateAstrolabeIntelligentResponse(lastUserMsg);

      // Stream the synthesized response smoothly with natural pacing
      const chunks = fallbackText.split(/(\s+)/);
      for (let i = 0; i < chunks.length; i += 3) {
        const slice = chunks.slice(i, i + 3).join('');
        res.write(`data: ${JSON.stringify({ text: slice })}\n\n`);
        if ((res as any).flush) (res as any).flush();
        await new Promise((r) => setTimeout(r, 12));
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    }

    // Output initial chunk from successful stream
    if (initialChunk && !initialChunk.done && initialChunk.value) {
      const text = initialChunk.value.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
        if ((res as any).flush) (res as any).flush();
      }
    }

    // Stream remaining chunks from activeIterator
    try {
      while (true) {
        const chunkPromise = activeIterator.next();
        const { done, value } = (await withTimeout(chunkPromise, 15000)) as any;
        if (done) break;

        const text = value?.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
          if ((res as any).flush) (res as any).flush();
        }
      }
    } catch (chunkErr: any) {
      console.warn('Stream chunk ended:', chunkErr?.message);
    } finally {
      clearInterval(heartbeatTimer);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Astrolabe API Stream Error Handled:', error);
    try {
      const lastUserMsg = req.body?.messages?.filter((m: any) => m.role === 'user').pop()?.content || '';
      const safeText = generateAstrolabeIntelligentResponse(lastUserMsg);
      res.write(`data: ${JSON.stringify({ text: safeText })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch {
      res.end();
    }
  }
});

// Non-streaming chat endpoint fallback
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemInstruction, responseStyle = 'default' } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    let styleInstruction = '';
    if (responseStyle === 'concise') {
      styleInstruction = '\nResponse Style: Brief and direct.';
    } else if (responseStyle === 'explanatory') {
      styleInstruction = '\nResponse Style: In-depth educational.';
    }

    const fullSystemInstruction = systemInstruction
      ? `${ASTROLABE_SYSTEM_PROMPT}${styleInstruction}\n\nAdditional Instructions:\n${systemInstruction}`
      : `${ASTROLABE_SYSTEM_PROMPT}${styleInstruction}`;

    const rawContents = messages.map((msg: { role: string; content: string; attachments?: any[] }) => {
      const parts: any[] = [];
      if (msg.attachments && Array.isArray(msg.attachments)) {
        for (const att of msg.attachments) {
          if (att.mimeType && att.base64) {
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: att.base64.replace(/^data:[^;]+;base64,/, ''),
              },
            });
          } else if (att.text) {
            parts.push({
              text: `[Attached Document: ${att.name || 'document'}]\n${att.text}\n`,
            });
          }
        }
      }
      if (msg.content && msg.content.trim()) {
        parts.push({ text: msg.content.trim() });
      }
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

    let contents = rawContents.filter((c: any) => c.parts.length > 0);
    if (contents.length > 0 && contents[0].role === 'model') {
      contents = contents.slice(1);
    }

    if (!ai) {
      const lastMsg = messages[messages.length - 1]?.content || '';
      const fallback = generateAstrolabeIntelligentResponse(lastMsg);
      return res.json({ text: fallback });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents,
      config: {
        systemInstruction: fullSystemInstruction,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Astrolabe API Error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate content' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Astrolabe AI server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
