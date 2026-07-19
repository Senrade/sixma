# Conventions

- Follow the repository's local Next.js 16 documentation before using framework APIs; do not rely on older Next.js conventions.
- Interactive components using state, effects, handlers, or browser APIs require a `"use client"` boundary.
- TypeScript uses strict types. Component prop interfaces are exported; module components currently provide both named and default exports.
- Source style uses double-quoted imports/strings and semicolons.
- Preserve data-file snake_case at the JSON boundary (for example `case_id`, `image_url`, `pool_items`); adapt to child UI camelCase props in controllers/adapters.
- Game modules are keyed under a case's `modules`: `step_1_image_forensics`, `step_2_text_highlight`, and `step_3_sorting_game`.
- Prefer `@/*` for cross-tree imports; relative imports are established for colocated component modules.