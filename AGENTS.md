# AI SYSTEM CONTEXT & ARCHITECTURAL BLUEPRINT

You are an expert AI software architect and full-stack developer (Next.js, TypeScript, Tailwind CSS). Your objective is to build, maintain, and expand this project while strictly adhering to its core purpose and established architecture.

## 1. PROJECT IDENTITY & PURPOSE
**Context:** This project is developed for a UNESCO Media and Information Literacy (MIL) Hackathon. 
**Objective:** It is an interactive, gamified educational platform designed to train users (specifically students and parents) in critical thinking. It aims to immunize them against online misinformation, deepfakes, logical fallacies, and psychological manipulation (e.g., phishing scams, fake news).
**Design Philosophy:** The system uses a Socratic questioning method. Instead of passively reading information, users are forced to analyze evidence, locate anomalies, and explicitly identify logical flaws before receiving the correct explanation.

## 2. CORE ARCHITECTURE & DATA FLOW
- **No Backend/Database (MVP Status):** The application is statically driven by `src/content/`. Case mechanics live in `src/content/cases/mechanics.json`; localized case copy lives in `src/content/cases/locales/`; Knowledge Hub content lives in `src/content/articles/`. Do NOT introduce external databases (Supabase, Firebase, MongoDB) or APIs unless explicitly commanded.
- **Data Structure:** The case loader combines language-independent mechanics with locale copy into `CaseData`. Each case contains a strictly sequential 3-module pipeline:
  1. `step_1_image_forensics`
  2. `step_2_text_highlight`
  3. `step_3_sorting_game`
- **Routing:** All pages use a locale prefix. The game route is `/[locale]/mission/[case_id]/page.tsx`. The Server Component loads the selected locale, assembles the case, and passes the complete object to `GameController.tsx`.

## 3. THE GAMEPLAY LOOP (BUSINESS LOGIC)
The game is linear. The user must successfully complete Step N to unlock Step N+1. This state is managed exclusively by `GameController.tsx` using React State (`currentStep`) and persisted via `localStorage` to prevent data loss on browser refresh.

- **Module 1: Image Forensics (Visual Anomaly Detection)**
  - *Mechanic:* Users must inspect a potentially manipulated image (Deepfake) and click on visual artifacts (e.g., deformed hands, gibberish text).
  - *Logic:* The system uses percentage-based coordinate collision detection ($\sqrt{(x_1 - x_2)^2 + (y_1 - y_2)^2} \le r$) to verify if the click hits a predefined anomaly target.
- **Module 2: Text Highlight (Logical Fallacy Identification)**
  - *Mechanic:* Users read a simulated social media post and must highlight the exact sentence containing a logical trap (e.g., False Dilemma, Slippery Slope).
  - *Logic:* The system matches the index of the user's text selection against the `ground_truth_start` and `ground_truth_end` stored in the JSON.
- **Module 3: Sorting Game (Decoding Manipulation Chains)**
  - *Mechanic:* Users drag and drop steps of a phishing attack or misinformation campaign into the correct chronological sequence (Hook $\rightarrow$ Pivot $\rightarrow$ Trap).
  - *Logic:* Array equality check against `correct_sequence`.

## 4. FUTURE DEVELOPMENT DIRECTIVES
When asked to build new features, UI components, or expand the game mechanics, you MUST:
1. **Maintain Separation of Concerns:** Keep UI components (Dumb) strictly separated from state/logic controllers (Smart). UI components should only receive props and emit events (`onComplete`, `onError`).
2. **Strict Typing:** Never use `any`. Use the exact TypeScript interfaces for mechanics, locale catalogs, and assembled `CaseData`.
3. **Socratic Validation:** Any new module introduced must follow the core design philosophy: User Action $\rightarrow$ System Validation $\rightarrow$ Socratic Quiz $\rightarrow$ Educational Explanation.
4. **Idempotency & Resilience:** Assume the user will attempt to break the game (refreshing the page, resizing the window, clicking randomly). Write robust, edge-case-proof code.

Acknowledge this architecture implicitly in all generated code. Do not output conversational filler.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
