import { access, readFile } from "node:fs/promises";
import path from "node:path";

const caseDirectory = path.join(process.cwd(), "src", "content", "cases");
const articleDirectory = path.join(process.cwd(), "src", "content", "articles");

function fail(message) {
  throw new Error(message);
}

function assertRecord(value, label) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`${label} must be an object.`);
  }
}

function assertAllowedKeys(value, allowedKeys, label) {
  assertRecord(value, label);
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) fail(`${label} contains forbidden field ${key}.`);
  }
}

function assertOptionalString(value, label) {
  if (value !== undefined && typeof value !== "string") fail(`${label} must be a string.`);
}

function assertOptionalStringArray(value, label) {
  if (value !== undefined && (!Array.isArray(value) || value.some((item) => typeof item !== "string"))) {
    fail(`${label} must be an array of strings.`);
  }
}

function assertDistinctStringArray(value, expectedLength, label) {
  if (!Array.isArray(value) || value.length !== expectedLength || value.some((item) => typeof item !== "string" || item.length === 0)) {
    fail(`${label} must contain exactly ${expectedLength} non-empty strings.`);
  }
  if (new Set(value).size !== value.length) fail(`${label} must not contain duplicate values.`);
}

function validateQuiz(quiz, label) {
  if (quiz === undefined) return;
  assertAllowedKeys(
    quiz,
    new Set(["question", "push_question", "options", "explanation"]),
    label,
  );
  assertOptionalString(quiz.question, `${label}.question`);
  assertOptionalString(quiz.push_question, `${label}.push_question`);
  assertOptionalStringArray(quiz.options, `${label}.options`);
  assertOptionalString(quiz.explanation, `${label}.explanation`);
}

function validateCaseTranslation(translation, label) {
  assertAllowedKeys(
    translation,
    new Set(["title", "short_summary", "skills", "theme", "story_context", "source", "modules", "dialogue_trigger"]),
    label,
  );
  for (const key of ["title", "short_summary", "story_context"]) {
    assertOptionalString(translation[key], `${label}.${key}`);
  }
  assertDistinctStringArray(translation.skills, 3, `${label}.skills`);
  assertDistinctStringArray(translation.theme, 2, `${label}.theme`);

  if (translation.source !== undefined) {
    assertAllowedKeys(translation.source, new Set(["note"]), `${label}.source`);
    assertOptionalString(translation.source.note, `${label}.source.note`);
  }

  if (translation.dialogue_trigger !== undefined) {
    assertAllowedKeys(translation.dialogue_trigger, new Set(["question", "mil_insight"]), `${label}.dialogue_trigger`);
    assertOptionalString(translation.dialogue_trigger.question, `${label}.dialogue_trigger.question`);
    assertOptionalString(translation.dialogue_trigger.mil_insight, `${label}.dialogue_trigger.mil_insight`);
  }

  if (translation.modules === undefined) return;
  assertAllowedKeys(
    translation.modules,
    new Set(["step_1_image_forensics", "step_2_text_highlight", "step_3_sorting_game"]),
    `${label}.modules`,
  );

  const image = translation.modules.step_1_image_forensics;
  if (image !== undefined) {
    assertAllowedKeys(image, new Set(["context_text", "target_anomalies", "socratic_quiz"]), `${label}.modules.step_1_image_forensics`);
    assertOptionalString(image.context_text, `${label}.modules.step_1_image_forensics.context_text`);
    validateQuiz(image.socratic_quiz, `${label}.modules.step_1_image_forensics.socratic_quiz`);
    if (image.target_anomalies !== undefined) {
      assertRecord(image.target_anomalies, `${label}.modules.step_1_image_forensics.target_anomalies`);
      for (const [id, anomaly] of Object.entries(image.target_anomalies)) {
        const anomalyLabel = `${label}.modules.step_1_image_forensics.target_anomalies.${id}`;
        assertAllowedKeys(anomaly, new Set(["description", "socratic_quiz"]), anomalyLabel);
        assertOptionalString(anomaly.description, `${anomalyLabel}.description`);
        validateQuiz(anomaly.socratic_quiz, `${anomalyLabel}.socratic_quiz`);
      }
    }
  }

  const text = translation.modules.step_2_text_highlight;
  if (text !== undefined) {
    assertAllowedKeys(text, new Set(["simulated_post", "traps"]), `${label}.modules.step_2_text_highlight`);
    if (text.simulated_post !== undefined) {
      assertAllowedKeys(text.simulated_post, new Set(["author", "time_posted", "content"]), `${label}.modules.step_2_text_highlight.simulated_post`);
      for (const key of ["author", "time_posted", "content"]) {
        assertOptionalString(text.simulated_post[key], `${label}.modules.step_2_text_highlight.simulated_post.${key}`);
      }
    }
    if (text.traps !== undefined) {
      assertRecord(text.traps, `${label}.modules.step_2_text_highlight.traps`);
      for (const [id, trap] of Object.entries(text.traps)) {
        const trapLabel = `${label}.modules.step_2_text_highlight.traps.${id}`;
        assertAllowedKeys(trap, new Set(["matched_text", "socratic_quiz"]), trapLabel);
        assertOptionalString(trap.matched_text, `${trapLabel}.matched_text`);
        validateQuiz(trap.socratic_quiz, `${trapLabel}.socratic_quiz`);
      }
    }
  }

  const sorting = translation.modules.step_3_sorting_game;
  if (sorting !== undefined) {
    assertAllowedKeys(sorting, new Set(["context_text", "pool_items", "validation_feedback"]), `${label}.modules.step_3_sorting_game`);
    assertOptionalString(sorting.context_text, `${label}.modules.step_3_sorting_game.context_text`);
    if (sorting.pool_items !== undefined) {
      assertRecord(sorting.pool_items, `${label}.modules.step_3_sorting_game.pool_items`);
      for (const [id, item] of Object.entries(sorting.pool_items)) {
        assertOptionalString(item, `${label}.modules.step_3_sorting_game.pool_items.${id}`);
      }
    }
    if (sorting.validation_feedback !== undefined) {
      assertAllowedKeys(sorting.validation_feedback, new Set(["success", "failure"]), `${label}.modules.step_3_sorting_game.validation_feedback`);
      assertOptionalString(sorting.validation_feedback.success, `${label}.modules.step_3_sorting_game.validation_feedback.success`);
      assertOptionalString(sorting.validation_feedback.failure, `${label}.modules.step_3_sorting_game.validation_feedback.failure`);
    }
  }
}

function assertKnownIds(translations, knownIds, label) {
  if (translations === undefined) return;
  assertRecord(translations, label);
  for (const id of Object.keys(translations)) {
    if (!knownIds.has(id)) fail(`${label} contains unknown ID ${id}.`);
  }
}

function assertUniqueMatchedText(content, matchedText, label) {
  if (typeof matchedText !== "string") fail(`${label}.matched_text must be a string.`);
  const first = content.indexOf(matchedText);
  const second = first >= 0 ? content.indexOf(matchedText, first + 1) : -1;
  if (first < 0 || second >= 0) {
    fail(`${label}.matched_text must appear exactly once in simulated_post.content.`);
  }
}

function assertSameShape(reference, candidate, label) {
  if (Array.isArray(reference)) {
    if (!Array.isArray(candidate) || candidate.length !== reference.length) {
      fail(`${label} must contain ${reference.length} entries.`);
    }
    reference.forEach((item, index) => assertSameShape(item, candidate[index], `${label}[${index}]`));
    return;
  }
  if (typeof reference === "object" && reference !== null) {
    assertRecord(candidate, label);
    for (const key of Object.keys(reference)) {
      if (!(key in candidate)) fail(`${label}.${key} is missing.`);
      assertSameShape(reference[key], candidate[key], `${label}.${key}`);
    }
    return;
  }
  if (typeof candidate !== typeof reference) fail(`${label} has the wrong value type.`);
}

function validateArticle(article, label) {
  // Allow an optional `date_posted` translation field for display; ensure it's a string when present.
  assertAllowedKeys(article, new Set(["category", "title", "summary", "sections", "date_posted"]), label);
  for (const key of ["category", "title", "summary"]) {
    if (typeof article[key] !== "string" || article[key].length === 0) fail(`${label}.${key} is required.`);
  }
  if (!Array.isArray(article.sections) || article.sections.length === 0) fail(`${label}.sections must not be empty.`);
  for (const [index, section] of article.sections.entries()) {
    const sectionLabel = `${label}.sections[${index}]`;
    assertAllowedKeys(section, new Set(["heading", "body", "items"]), sectionLabel);
    const hasBody = typeof section.body === "string" && section.body.length > 0;
    const hasItems = Array.isArray(section.items)
      && section.items.length > 0
      && section.items.every((item) => typeof item === "string" && item.length > 0);
    if (typeof section.heading !== "string" || section.heading.length === 0 || hasBody === hasItems) {
      fail(`${sectionLabel} requires a heading and exactly one of a body string or non-empty items list.`);
    }
  }
  assertOptionalString(article.date_posted, `${label}.date_posted`);
}

const registrySource = await readFile(
  path.join(process.cwd(), "src", "i18n", "registry.ts"),
  "utf8",
);
const localeDefinitionPattern =
  /^  ([a-z][a-z0-9-]*): \{[\s\S]*?^    status: "(complete|partial)",/gm;
const LOCALES = Object.fromEntries(
  [...registrySource.matchAll(localeDefinitionPattern)].map((match) => [
    match[1],
    { status: match[2] },
  ]),
);
if (!("en" in LOCALES) || Object.keys(LOCALES).length === 0) {
  fail("src/i18n/registry.ts must register English and at least one locale.");
}
const mechanicsCatalog = JSON.parse(await readFile(path.join(caseDirectory, "mechanics.json"), "utf8"));
if (mechanicsCatalog.schema_version !== 1 || !Array.isArray(mechanicsCatalog.cases)) {
  fail("cases/mechanics.json must use schema_version 1 and contain a cases array.");
}
const mechanicsById = new Map(mechanicsCatalog.cases.map((caseData) => [caseData.case_id, caseData]));
const knownCaseIds = new Set(mechanicsById.keys());
const englishCases = JSON.parse(await readFile(path.join(caseDirectory, "locales", "en.json"), "utf8"));
const articleIndex = JSON.parse(await readFile(path.join(articleDirectory, "index.json"), "utf8"));
const knownArticleSlugs = new Set(articleIndex.articles.map((article) => article.slug));
const englishMessageSource = await readFile(path.join(process.cwd(), "src", "i18n", "messages", "en.ts"), "utf8");
const messageKeyPattern = /^\s*"([^"]+)":/gm;
const englishMessageKeys = new Set([...englishMessageSource.matchAll(messageKeyPattern)].map((match) => match[1]));

for (const caseData of mechanicsCatalog.cases) {
  const urls = [caseData.spotted_url, caseData.modules.step_1_image_forensics.image_url];
  for (const url of urls) {
    try {
      await access(path.join(process.cwd(), "public", url.replace(/^\/+/, "")));
    } catch {
      fail(`Case ${caseData.case_id} references missing public asset ${url}.`);
    }
  }
}

for (const [locale, definition] of Object.entries(LOCALES)) {
  const caseFile = `cases/locales/${locale}.json`;
  const cases = JSON.parse(await readFile(path.join(caseDirectory, "locales", `${locale}.json`), "utf8"));
  assertRecord(cases, caseFile);
  assertKnownIds(cases, knownCaseIds, caseFile);

  const missingCases = [...knownCaseIds].filter((caseId) => !(caseId in cases));
  if (definition.status === "complete" && missingCases.length > 0) {
    fail(`${locale} is complete but is missing cases: ${missingCases.join(", ")}.`);
  }

  const standardSkills = Object.values(cases)[0]?.skills;
  for (const [caseId, translation] of Object.entries(cases)) {
    const label = `${caseFile}:${caseId}`;
    validateCaseTranslation(translation, label);
    if (JSON.stringify(translation.skills) !== JSON.stringify(standardSkills)) {
      fail(`${label}.skills must use the same three module-aligned labels as every other case in ${locale}.`);
    }
    assertSameShape(englishCases[caseId], translation, label);
    const mechanics = mechanicsById.get(caseId);
    const imageTranslation = translation.modules.step_1_image_forensics;
    const textTranslation = translation.modules.step_2_text_highlight;
    const sortingTranslation = translation.modules.step_3_sorting_game;

    assertKnownIds(
      imageTranslation.target_anomalies,
      new Set(mechanics.modules.step_1_image_forensics.target_anomalies.map((item) => item.anomaly_id)),
      `${label}:target_anomalies`,
    );
    assertKnownIds(
      textTranslation.traps,
      new Set(mechanics.modules.step_2_text_highlight.traps.map((item) => item.trap_id)),
      `${label}:traps`,
    );
    assertKnownIds(
      sortingTranslation.pool_items,
      new Set(mechanics.modules.step_3_sorting_game.pool_item_ids),
      `${label}:pool_items`,
    );
    for (const trap of Object.values(textTranslation.traps)) {
      assertUniqueMatchedText(textTranslation.simulated_post.content, trap.matched_text, label);
    }
  }

  const articleFile = `articles/locales/${locale}.json`;
  const articles = JSON.parse(await readFile(path.join(articleDirectory, "locales", `${locale}.json`), "utf8"));
  assertRecord(articles, articleFile);
  assertKnownIds(articles, knownArticleSlugs, articleFile);
  const missingArticles = [...knownArticleSlugs].filter((slug) => !(slug in articles));
  if (missingArticles.length > 0) fail(`${articleFile} is missing: ${missingArticles.join(", ")}.`);
  for (const [slug, article] of Object.entries(articles)) validateArticle(article, `${articleFile}:${slug}`);

  const messageSource = await readFile(
    path.join(process.cwd(), "src", "i18n", "messages", `${locale}.ts`),
    "utf8",
  );
  const messageKeys = new Set([...messageSource.matchAll(messageKeyPattern)].map((match) => match[1]));
  const missingMessages = [...englishMessageKeys].filter((key) => !messageKeys.has(key));
  if (definition.status === "complete" && missingMessages.length > 0) {
    fail(`${locale} is complete but is missing interface messages: ${missingMessages.join(", ")}.`);
  }

  console.log(
    `Validated ${locale}: ${knownCaseIds.size - missingCases.length}/${knownCaseIds.size} cases, ${knownArticleSlugs.size}/${knownArticleSlugs.size} articles, ${englishMessageKeys.size - missingMessages.length}/${englishMessageKeys.size} interface messages${missingCases.length || missingMessages.length ? ` (fallback: ${[...missingCases, ...missingMessages].join(", ")})` : ""}.`,
  );
}
