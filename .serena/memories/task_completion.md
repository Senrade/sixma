# Task Completion

For Next.js coding changes:

1. Read the relevant local guide under `node_modules/next/dist/docs/` before editing.
2. Run `npx.cmd tsc --noEmit`.
3. Run `npm.cmd run lint`; if repository-wide pre-existing failures exist, also lint the touched files directly and report both.
4. Run `npm.cmd run build` for changes affecting runtime integration or routes.
5. Check `git status --short` to confirm only intended files changed.

There is currently no automated test script or formatter script. Production builds may fail in restricted-network environments while `next/font` fetches Geist from Google; distinguish that environmental failure from source compilation failures.