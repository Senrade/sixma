# Tech Stack

- Next.js 16.2.10 App Router with React and React DOM 19.2.4.
- TypeScript 5 in strict, no-emit mode; bundler module resolution; `@/*` maps to `src/*`.
- Tailwind CSS 4 through `@tailwindcss/postcss`.
- ESLint 9 with Next core-web-vitals and TypeScript presets.
- npm is the canonical package manager; `package-lock.json` is committed.
- `src/app/layout.tsx` uses `next/font` with Google-hosted Geist and Geist Mono, so production builds need font-fetch network access unless fonts are localized.