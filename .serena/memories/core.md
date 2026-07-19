# Project Core

- UNESCO Youth Hackathon Media and Information Literacy game, implemented as a Next.js App Router frontend.
- Game content is data-driven: `public/data/cases.json` contains case modules; `public/data/weapons.json` contains manipulation-weapon data.
- App shell and route entrypoints live in `src/app/`; game UI lives in `src/components/`, with module views under `src/components/modules/`.
- `AGENTS.md` is binding: this Next.js version has breaking changes. Before editing Next.js code, read the relevant guide under `node_modules/next/dist/docs/` and heed deprecations.
- Read `mem:tech_stack` for pinned framework/tooling details.
- Read `mem:conventions` for source and data-boundary patterns.
- Read `mem:suggested_commands` for Windows-safe development commands.
- Read `mem:task_completion` for required verification checks.