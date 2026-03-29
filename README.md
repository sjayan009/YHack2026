# Forge Coding Mentor 🚀

Forge is an adaptive, AI-powered coding mentor built for **YHack 2026**. Designed to gamify the learning experience for tweens and young developers, Forge immerses users in real-world scenarios where their code has direct consequences.

Unlike traditional coding tutorials, Forge features **Atlas**, an AI mentor powered by Google's Gemini 1.5 Flash model. Atlas doesn't just grade your code—it actively analyzes your real-time behavior (keystrokes, deletions, and errors) to understand your cognitive state and switches personas dynamically to provide the exact coaching you need.

## 🌟 Key Features

### 1. Adaptive AI Personas (Cognitive Orchestrator)
The backend intercepts every action in the workspace and feeds a rolling window of telemetry (idle time, deletion bursts, terminal errors) into the Orchestrator. The AI automatically switches between:
- **Senior Dev (Default):** Restores seamlessly when you are in a "flow" state and typing smoothly without errors.
- **Rubber Duck:** Activates immediately when you hit syntax errors or highlight/delete massive chunks of code out of frustration. Instead of giving you answers, the Duck gently forces you to explain your logic.
- **Skeptical User:** A playful persona that triggers if you spam the "Run Code" button repeatedly without actually typing new code, calling you out for "guessing and checking."

### 2. Progressive Educational Curriculum
The platform scales beyond a single sandbox. As users select different deployment sectors, they advance through a 4-tier computer science curriculum, each with custom regex validators and context-aware AI prompts:
- **Chapter 1: Control Flow (Game Studio)** — Learn boundary constraints and `if` statements to stop a video game score from dropping dynamically below zero.
- **Chapter 2: Data Structures (Music Tech)** — Learn `Array.push()` methods to append new string tracks to an active DJ queue system.
- **Chapter 3: Iteration (Space Agency)** — Learn `for` loops to systematically iterate variables and safely deploy 5 heavy supply crates from a Lunar Lander.
- **Chapter 4: Object Mutation (Wildlife Lab)** — Interact with complex JSON data structures using dot-notation (`drone.status = "Online"`) to boot up hardware.

### 3. Frictionless Auth & Cloud Persistence (Supabase)
To optimize for incredibly fast hackathon testing and multi-judge deployment:
- **Call-Sign Login:** Type a unique name to generate (or seamlessly resume) an anonymous hackathon profile backed natively by a **Supabase Cloud Database**.
- **Trophy Room:** The Onboarding screen tracks real-time progress, letting you swap to a gallery view to see the glowing badges collected from your merged missions!

## 🛠️ Tech Stack View

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Framer Motion
- **Backend Orchestrator:** Next.js Server Actions 
- **AI Brain:** `@google/generative-ai` (Gemini-1.5-Flash)
- **Database:** Supabase (`@supabase/supabase-js`)
- **Icons:** Lucide-React

## 🚀 Getting Started

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory and add your credentials:
```env
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Setup your Supabase SQL tables (execute via SQL Editor):
```sql
create table public.forge_users (
  id uuid default gen_random_uuid() primary key,
  call_sign text not null,
  active_world text,
  completed_worlds jsonb default '[]'::jsonb
);

alter table public.forge_users enable row level security;
create policy "Allow public access for MVP" on public.forge_users for all using (true) with check (true);
```

4. Run the development server!
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser and enter your Call Sign to begin!
