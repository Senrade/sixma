# Suggested Commands

Run from the project root in PowerShell:

- Development server: `npm.cmd run dev`
- Production build: `npm.cmd run build`
- Full lint: `npm.cmd run lint`
- Type check: `npx.cmd tsc --noEmit`
- File listing/search: `rg --files`, `rg -n "pattern" src public`
- Worktree check: `git status --short`

Use the `.cmd` npm/npx shims when PowerShell execution policy blocks `npm.ps1` or `npx.ps1`. No test or formatter script is currently defined.