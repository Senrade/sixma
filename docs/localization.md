# Localization guide

This guide is the team contract for adding languages and editing translated
content. The application has no database or translation service. Everything is
versioned with the code and validated before a production build.

## Architecture

```text
src/
  app/[locale]/                 Locale-prefixed pages
  content/
    cases/
      mechanics.json           IDs, assets, coordinates, answers, sequences
      locales/
        en.json                 English case copy
        vi.json                 Vietnamese case copy
      archive/                  Optional storage for retired copy
    articles/
      index.json                Stable article slugs and reading times
      locales/
        en.json                 English Knowledge Hub copy
        vi.json                 Vietnamese Knowledge Hub copy
  i18n/
    messages/                   Buttons, navigation, forms, page labels
    locales/                    One resource module per language
    registry.ts                 The only language registration list
```

Routes always include a locale: `/en/cases/R001`, `/vi/learn/phishing-chain`,
and so on. `src/proxy.ts` redirects old unprefixed links to a saved or detected
language. The language selector changes the URL, so localized pages are
shareable and can be statically generated.

## Three types of content

### Interface messages

Use `src/i18n/messages/<locale>.ts` for reusable interface copy such as button
labels, navigation, validation messages, and page introductions.

```ts
export const fr = {
  "nav.home": "Accueil",
  "learn.read": "Lire le guide",
  // Keep every key from messages/en.ts.
} as const;
```

Do not put case stories or full Knowledge Hub articles in this file.

### Cases

`mechanics.json` is language-independent. Only developers should edit it.

```json
{
  "case_id": "R001",
  "duration_min": 15,
  "modules": {
    "step_1_image_forensics": {
      "image_url": "/assets/images/R001/R001_fake.jpg",
      "target_anomalies": [
        {
          "anomaly_id": "R001_IMG_01",
          "x_pct": 57.4,
          "y_pct": 18.7,
          "radius_pct": 14.5,
          "socratic_quiz": { "correct_option": "B" }
        }
      ]
    }
  }
}
```

Locale files contain only text and address nested content by stable ID:

```json
{
  "R001": {
    "title": "Localized case title",
    "short_summary": "Localized summary",
    "modules": {
      "step_1_image_forensics": {
        "target_anomalies": {
          "R001_IMG_01": {
            "description": "Localized explanation",
            "socratic_quiz": {
              "question": "Localized question?",
              "options": ["A. ...", "B. ...", "C. ..."],
              "explanation": "Localized teaching feedback"
            }
          }
        }
      }
    }
  }
}
```

### Discovery metadata

The case hub and briefing must create curiosity without revealing the verdict.
Treat these fields as a spoiler-free discovery layer:

| Field | Editorial purpose | Rule |
| --- | --- | --- |
| `title` | A short context hook or open question | Do not state that the evidence is fake, manipulated, a scam, or generated. |
| `short_summary` | The claim, setting, and stakes | Describe what is circulating, not what the investigation will prove. |
| `theme` | Broad subject domains used as discovery tags | Use exactly two short, distinct topics such as `Education`, `Technology`, or `Public health`. Never use a verdict or tactic as a topic. |
| `skills` | The three module-level competencies | Use the same three labels for every case in that locale, in this order: visual evidence, language and claims, information chains. Translate the labels naturally when adding a locale. |
| `story_context` | The pre-mission briefing | Present attribution gaps and open questions, but reserve the answer and teaching explanation for gameplay and debrief. |

Good summary:

> A Discord channel races with screenshots, urgent messages, and offers tied to
> a supposed national exam leak.

Avoid:

> Expose the fake screenshot, manipulation tactics, and phishing scam.

Detailed terms such as `phishing`, `false dilemma`, `synthetic image`, and
`credential theft` belong in module questions, explanations, Knowledge Hub
content, and the debrief after the learner has examined the evidence.

The translation validator enforces two distinct themes, three distinct skills,
and consistent skill labels across every case in a locale. When adding a new
theme, choose a broad domain that can be reused instead of creating a tag for a
single case outcome.

Never add coordinates, image paths, answer keys, weapon IDs, case levels, or
sorting sequences to a locale file. A translated case must contain the same
text structure and IDs as its English entry.

`step_3_sorting_game.context_text` may be omitted. When it is absent, the loader
uses that locale's `story_context` so the sorting module never renders blank.

For text highlighting, `matched_text` must occur exactly once inside the same
locale's `simulated_post.content`. Character offsets are calculated by the
loader. Translators must never calculate offsets.

### Knowledge Hub articles

Add stable identity and reading time to `src/content/articles/index.json`:

```json
{ "slug": "verify-a-source", "read_time": 6 }
```

Add the full article to every published locale catalog:

```json
{
  "verify-a-source": {
    "category": "Source verification",
    "title": "How to verify a source",
    "summary": "A short description shown in the Knowledge Hub.",
    "sections": [
      {
        "heading": "Find the original",
        "body": "The complete localized paragraph goes here."
      }
    ]
  }
}
```

Article slugs do not change between languages. This keeps links stable.

## Add a language

The example below uses French (`fr`).

1. Copy `src/i18n/messages/en.ts` to `src/i18n/messages/fr.ts` and translate
   values without changing keys.
2. Copy `src/content/cases/locales/en.json` to
   `src/content/cases/locales/fr.json`. Translate text only.
3. Copy `src/content/articles/locales/en.json` to
   `src/content/articles/locales/fr.json`. Translate every article.
4. Create `src/i18n/locales/fr.ts`:

```ts
import { fr as messages } from "@/i18n/messages/fr";
import articles from "@/content/articles/locales/fr.json";
import cases from "@/content/cases/locales/fr.json";

export default { articles, cases, messages };
```

5. Add one entry to `LOCALES` in `src/i18n/registry.ts`:

```ts
fr: {
  label: "Français",
  htmlLang: "fr",
  status: "partial",
  fallback: "en",
  load: () => import("./locales/fr").then((module) => module.default),
},
```

6. Run `npm.cmd run validate:translations` after every translation session.
7. Change `status` to `"complete"` only when the validator reports every case.
8. Run type checking, lint, and a production build before merging.

The language selector is generated from the registry. No header or footer edit
is needed when adding a language.

## Completeness and fallback

- `complete`: every case must exist; missing content fails the build.
- `partial`: a whole missing case falls back to English and is reported by the
  validator. A partially translated case object is not allowed.
- Knowledge Hub articles are required in every registered language because
  mixing languages inside an article library is confusing.
- Interface keys currently fall back to English while a locale is partial.

Current coverage: Vietnamese is `complete`, with all six active cases, all three
Knowledge Hub articles, and every interface message translated.

## Add or retire a case

To add a case:

1. Add mechanics with new stable IDs to `mechanics.json`.
2. Add complete English copy to `locales/en.json`.
3. Add the case to every `complete` locale.
4. Partial locales may omit the entire case until translation is ready.
5. Add image assets under `public/assets/images/<case_id>/`.
6. Run all required checks.

To retire a case, remove its mechanics and active locale entries together. Move
valuable translations into `src/content/cases/archive/` so they are not loaded
or validated but remain available for future reuse.

## Common validation errors

- `unknown ID`: the locale uses an old case, anomaly, trap, or sorting-item ID.
- `is missing`: a translated object does not match the English text structure.
- `matched_text must appear exactly once`: update the translated post or exact
  highlighted sentence so they agree.
- `complete but is missing cases`: change the locale to `partial` during work or
  finish the missing case before publishing.
- Missing article error: add the article slug to that locale's article catalog.

## Production note

Locale catalogs are loaded on the server and only the selected content is
rendered. Game answers still reach the browser because this static MVP validates
gameplay on the client. Protecting answer keys would require server-side
validation and is a separate backend/security change.
