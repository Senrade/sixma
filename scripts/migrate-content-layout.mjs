import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const currentCases = JSON.parse(
  await readFile(path.join(projectRoot, "public", "data", "cases.json"), "utf8"),
);
const vietnameseCases = JSON.parse(
  await readFile(path.join(projectRoot, "public", "data", "cases.vi.json"), "utf8"),
);

function remapObjectKeys(value, oldPrefix, newPrefix) {
  if (Array.isArray(value)) {
    return value.map((item) => remapObjectKeys(item, oldPrefix, newPrefix));
  }
  if (typeof value !== "object" || value === null) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key.startsWith(`${oldPrefix}_`) ? `${newPrefix}${key.slice(oldPrefix.length)}` : key,
      remapObjectKeys(item, oldPrefix, newPrefix),
    ]),
  );
}

function quizMechanics(quiz) {
  return quiz ? { correct_option: quiz.correct_option } : undefined;
}

function quizCopy(quiz) {
  if (!quiz) return undefined;
  return {
    question: quiz.question,
    push_question: quiz.push_question,
    options: quiz.options,
    explanation: quiz.explanation,
  };
}

function caseMechanics(caseData) {
  const image = caseData.modules.step_1_image_forensics;
  const text = caseData.modules.step_2_text_highlight;
  const sorting = caseData.modules.step_3_sorting_game;
  return {
    level: caseData.level,
    case_id: caseData.case_id,
    duration_min: caseData.duration_min,
    spotted_url: caseData.spotted_url,
    source: caseData.source
      ? { title: caseData.source.title, url: caseData.source.url }
      : undefined,
    modules: {
      step_1_image_forensics: {
        mechanic_type: image.mechanic_type,
        image_url: image.image_url,
        image_width: image.image_width,
        image_height: image.image_height,
        target_anomalies: image.target_anomalies.map((anomaly) => ({
          anomaly_id: anomaly.anomaly_id,
          name: anomaly.name,
          x_pct: anomaly.x_pct,
          y_pct: anomaly.y_pct,
          radius_pct: anomaly.radius_pct,
          socratic_quiz: quizMechanics(anomaly.socratic_quiz),
        })),
        socratic_quiz: quizMechanics(image.socratic_quiz),
      },
      step_2_text_highlight: {
        mechanic_type: text.mechanic_type,
        traps: text.traps.map((trap) => ({
          trap_id: trap.trap_id,
          weapon_type: trap.weapon_type,
          socratic_quiz: quizMechanics(trap.socratic_quiz),
        })),
      },
      step_3_sorting_game: {
        mechanic_type: sorting.mechanic_type,
        pool_item_ids: sorting.pool_items.map((item) => item.item_id),
        correct_sequence: sorting.correct_sequence,
      },
    },
  };
}

function caseCopy(caseData) {
  const image = caseData.modules.step_1_image_forensics;
  const text = caseData.modules.step_2_text_highlight;
  const sorting = caseData.modules.step_3_sorting_game;
  return {
    title: caseData.title,
    short_summary: caseData.short_summary,
    skills: caseData.skills,
    theme: caseData.theme,
    story_context: caseData.story_context,
    source: caseData.source ? { note: caseData.source.note } : undefined,
    modules: {
      step_1_image_forensics: {
        context_text: image.context_text,
        target_anomalies: Object.fromEntries(
          image.target_anomalies.map((anomaly) => [
            anomaly.anomaly_id,
            {
              description: anomaly.description,
              socratic_quiz: quizCopy(anomaly.socratic_quiz),
            },
          ]),
        ),
        socratic_quiz: quizCopy(image.socratic_quiz),
      },
      step_2_text_highlight: {
        simulated_post: text.simulated_post,
        traps: Object.fromEntries(
          text.traps.map((trap) => [
            trap.trap_id,
            {
              matched_text: trap.matched_text,
              socratic_quiz: quizCopy(trap.socratic_quiz),
            },
          ]),
        ),
      },
      step_3_sorting_game: {
        context_text: sorting.context_text,
        pool_items: Object.fromEntries(
          sorting.pool_items.map((item) => [item.item_id, item.text]),
        ),
        validation_feedback: sorting.validation_feedback,
      },
    },
    dialogue_trigger: caseData.dialogue_trigger,
  };
}

const contentDirectory = path.join(projectRoot, "src", "content", "cases");
const localeDirectory = path.join(contentDirectory, "locales");
const archiveDirectory = path.join(contentDirectory, "archive");
await mkdir(localeDirectory, { recursive: true });
await mkdir(archiveDirectory, { recursive: true });

const mechanics = {
  schema_version: 1,
  cases: currentCases.map(caseMechanics),
};
const english = Object.fromEntries(
  currentCases.map((caseData) => [caseData.case_id, caseCopy(caseData)]),
);
const vietnamese = {
  D001: vietnameseCases.D001,
  R001: vietnameseCases.R001,
  R007: remapObjectKeys(vietnameseCases.R002, "R002", "R007"),
  R002: remapObjectKeys(vietnameseCases.R003, "R003", "R002"),
};

await Promise.all([
  writeFile(path.join(contentDirectory, "mechanics.json"), `${JSON.stringify(mechanics, null, 2)}\n`),
  writeFile(path.join(localeDirectory, "en.json"), `${JSON.stringify(english, null, 2)}\n`),
  writeFile(path.join(localeDirectory, "vi.json"), `${JSON.stringify(vietnamese, null, 2)}\n`),
  writeFile(path.join(archiveDirectory, "R005.vi.json"), `${JSON.stringify(vietnameseCases.R005, null, 2)}\n`),
]);

console.log(`Migrated ${currentCases.length} cases.`);
