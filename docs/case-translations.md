# Case translation workflow

`public/data/cases.json` is the canonical English source and the only complete
gameplay schema. Locale files such as `public/data/cases.vi.json` are translation
overlays, not standalone case files.

## What translators edit

- Keep each case under its stable `case_id` key.
- Translate only human-facing text.
- Address anomalies, traps, and sorting items by their existing IDs.
- Keep `matched_text` identical to the translated sentence inside
  `simulated_post.content`. It must occur exactly once.
- Omit untranslated fields. The application falls back to English per field.

Do not copy or edit mechanic types, asset URLs, image dimensions, anomaly
coordinates, radii, answer keys, weapon IDs, sorting order, duration, level, or
case IDs in a locale file. Those values are inherited from `cases.json`.

## Add another locale

1. Copy the overlay shape, not the full English case objects, to
   `public/data/cases.<locale>.json`.
2. Add the locale to `SUPPORTED_LOCALES` in `src/i18n/config.ts`.
3. Add its filename to `translationFileNames` in `src/lib/cases.ts`.
4. Add its interface messages in `src/i18n/messages/` and register them in
   `src/i18n/I18nProvider.tsx`.
5. Add it to the language selector in `src/components/site/SiteHeader.tsx`.
6. Run `npm run validate:translations`, type checking, lint, and build.

Highlight offsets are derived from `matched_text` during loading, so translators
must not calculate or maintain character indexes.
