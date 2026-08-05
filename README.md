# SIXMA

SIXMA is a statically driven Next.js media and information literacy game for
the UNESCO Youth Hackathon. It supports locale-prefixed routes and separates
game mechanics from translated editorial content.

## Start locally

Requirements: Node.js 20 or newer and npm.

```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:3000`. The app redirects to the saved or detected
language, for example `http://localhost:3000/vi` or `http://localhost:3000/en`.

## Required checks

```powershell
npm.cmd run validate:translations
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd run build
```

`npm.cmd run build` runs translation validation automatically.

## Editing content

- Interface labels: `src/i18n/messages/`
- Case mechanics: `src/content/cases/mechanics.json`
- Translated case copy: `src/content/cases/locales/`
- Knowledge Hub index: `src/content/articles/index.json`
- Translated articles: `src/content/articles/locales/`
- Language registration: `src/i18n/registry.ts`

Read [docs/localization.md](docs/localization.md) before adding or publishing a
language. It includes complete examples and the team checklist.
