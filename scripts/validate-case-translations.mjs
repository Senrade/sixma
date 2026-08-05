import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const dataDirectory = path.join(process.cwd(), "public", "data");

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
  assertOptionalStringArray(translation.skills, `${label}.skills`);
  assertOptionalStringArray(translation.theme, `${label}.theme`);

  if (translation.source !== undefined) {
    assertAllowedKeys(translation.source, new Set(["title", "note"]), `${label}.source`);
    assertOptionalString(translation.source.title, `${label}.source.title`);
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

const baseCases = JSON.parse(await readFile(path.join(dataDirectory, "cases.json"), "utf8"));
if (!Array.isArray(baseCases)) fail("cases.json must be an array.");

const baseById = new Map(baseCases.map((caseData) => [caseData.case_id, caseData]));
for (const caseData of baseCases) {
  for (const trap of caseData.modules.step_2_text_highlight.traps) {
    assertUniqueMatchedText(
      caseData.modules.step_2_text_highlight.simulated_post.content,
      trap.matched_text,
      `cases.json:${caseData.case_id}:${trap.trap_id}`,
    );
  }
}

const translationFiles = (await readdir(dataDirectory))
  .filter((fileName) => /^cases\.[^.]+\.json$/.test(fileName))
  .sort();

for (const fileName of translationFiles) {
  const catalog = JSON.parse(await readFile(path.join(dataDirectory, fileName), "utf8"));
  assertRecord(catalog, fileName);
  assertKnownIds(catalog, new Set(baseById.keys()), fileName);

  for (const [caseId, translation] of Object.entries(catalog)) {
    validateCaseTranslation(translation, `${fileName}:${caseId}`);
    const base = baseById.get(caseId);
    const imageTranslation = translation.modules?.step_1_image_forensics;
    const textTranslation = translation.modules?.step_2_text_highlight;
    const sortingTranslation = translation.modules?.step_3_sorting_game;

    assertKnownIds(
      imageTranslation?.target_anomalies,
      new Set(base.modules.step_1_image_forensics.target_anomalies.map((item) => item.anomaly_id)),
      `${fileName}:${caseId}:target_anomalies`,
    );
    assertKnownIds(
      textTranslation?.traps,
      new Set(base.modules.step_2_text_highlight.traps.map((item) => item.trap_id)),
      `${fileName}:${caseId}:traps`,
    );
    assertKnownIds(
      sortingTranslation?.pool_items,
      new Set(base.modules.step_3_sorting_game.pool_items.map((item) => item.item_id)),
      `${fileName}:${caseId}:pool_items`,
    );

    const content = textTranslation?.simulated_post?.content
      ?? base.modules.step_2_text_highlight.simulated_post.content;
    for (const trap of base.modules.step_2_text_highlight.traps) {
      const matchedText = textTranslation?.traps?.[trap.trap_id]?.matched_text ?? trap.matched_text;
      assertUniqueMatchedText(content, matchedText, `${fileName}:${caseId}:${trap.trap_id}`);
    }
  }

  console.log(`Validated ${fileName}`);
}

if (translationFiles.length === 0) console.log("No case translation files found.");
