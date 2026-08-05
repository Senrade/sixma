import "server-only";

import mechanicsJson from "@/content/cases/mechanics.json";
import { loadLocale, type Locale } from "@/i18n/registry";
import type { CaseMechanics, CaseMechanicsCatalog, QuizMechanics } from "./case-content-types";
import type { CaseData, SocraticQuiz, TextHighlightTrap } from "./case-types";
import type { CaseTranslation, CaseTranslationCatalog, SocraticQuizTranslation } from "./case-translations";

const mechanicsCatalog = mechanicsJson as CaseMechanicsCatalog;
const localizedCasesPromises = new Map<Locale, Promise<CaseData[]>>();

function requiredString(value: string | undefined, path: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing localized case text at ${path}.`);
  }
  return value;
}

function requiredStrings(value: string[] | undefined, path: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`Missing localized string list at ${path}.`);
  }
  return value;
}

function localizedValue<T>(localized: T | undefined, english: T | undefined): T | undefined {
  return localized ?? english;
}

function createQuiz(
  mechanics: QuizMechanics | undefined,
  english: SocraticQuizTranslation | undefined,
  localized: SocraticQuizTranslation | undefined,
  path: string,
): SocraticQuiz | undefined {
  if (!mechanics && !english && !localized) return undefined;
  const copy = { ...english, ...localized };
  return {
    question: copy.question,
    push_question: copy.push_question,
    options: requiredStrings(copy.options, `${path}.options`),
    correct_option: mechanics?.correct_option,
    explanation: copy.explanation,
  };
}

function normalizeTrapOffsets(trap: TextHighlightTrap, content: string): TextHighlightTrap {
  const start = content.indexOf(trap.matched_text);
  const appearsAgain = start >= 0 && content.indexOf(trap.matched_text, start + 1) >= 0;
  if (start < 0 || appearsAgain) {
    throw new Error(
      `Trap ${trap.trap_id} matched_text must appear exactly once in simulated_post.content.`,
    );
  }
  return {
    ...trap,
    ground_truth_start: start,
    ground_truth_end: start + trap.matched_text.length,
  };
}

function assertKnownIds(
  values: Record<string, unknown> | undefined,
  knownIds: ReadonlySet<string>,
  path: string,
): void {
  for (const id of Object.keys(values ?? {})) {
    if (!knownIds.has(id)) throw new Error(`Unknown localized ID ${path}.${id}.`);
  }
}

function assembleCase(
  mechanics: CaseMechanics,
  english: CaseTranslation,
  localized?: CaseTranslation,
): CaseData {
  const imageMechanics = mechanics.modules.step_1_image_forensics;
  const textMechanics = mechanics.modules.step_2_text_highlight;
  const sortingMechanics = mechanics.modules.step_3_sorting_game;
  const imageEnglish = english.modules?.step_1_image_forensics;
  const imageLocalized = localized?.modules?.step_1_image_forensics;
  const textEnglish = english.modules?.step_2_text_highlight;
  const textLocalized = localized?.modules?.step_2_text_highlight;
  const sortingEnglish = english.modules?.step_3_sorting_game;
  const sortingLocalized = localized?.modules?.step_3_sorting_game;

  assertKnownIds(
    imageLocalized?.target_anomalies,
    new Set(imageMechanics.target_anomalies.map((item) => item.anomaly_id)),
    `${mechanics.case_id}.target_anomalies`,
  );
  assertKnownIds(
    textLocalized?.traps,
    new Set(textMechanics.traps.map((item) => item.trap_id)),
    `${mechanics.case_id}.traps`,
  );
  assertKnownIds(
    sortingLocalized?.pool_items,
    new Set(sortingMechanics.pool_item_ids),
    `${mechanics.case_id}.pool_items`,
  );

  const simulatedPost = {
    author: requiredString(
      localizedValue(textLocalized?.simulated_post?.author, textEnglish?.simulated_post?.author),
      `${mechanics.case_id}.simulated_post.author`,
    ),
    time_posted: requiredString(
      localizedValue(textLocalized?.simulated_post?.time_posted, textEnglish?.simulated_post?.time_posted),
      `${mechanics.case_id}.simulated_post.time_posted`,
    ),
    content: requiredString(
      localizedValue(textLocalized?.simulated_post?.content, textEnglish?.simulated_post?.content),
      `${mechanics.case_id}.simulated_post.content`,
    ),
  };

  return {
    level: mechanics.level,
    case_id: mechanics.case_id,
    title: requiredString(localizedValue(localized?.title, english.title), `${mechanics.case_id}.title`),
    short_summary: requiredString(localizedValue(localized?.short_summary, english.short_summary), `${mechanics.case_id}.short_summary`),
    duration_min: mechanics.duration_min,
    skills: requiredStrings(localizedValue(localized?.skills, english.skills), `${mechanics.case_id}.skills`),
    spotted_url: mechanics.spotted_url,
    theme: requiredStrings(localizedValue(localized?.theme, english.theme), `${mechanics.case_id}.theme`),
    story_context: requiredString(localizedValue(localized?.story_context, english.story_context), `${mechanics.case_id}.story_context`),
    source: mechanics.source
      ? {
          ...mechanics.source,
          note: requiredString(localizedValue(localized?.source?.note, english.source?.note), `${mechanics.case_id}.source.note`),
        }
      : undefined,
    modules: {
      step_1_image_forensics: {
        mechanic_type: imageMechanics.mechanic_type,
        image_url: imageMechanics.image_url,
        image_width: imageMechanics.image_width,
        image_height: imageMechanics.image_height,
        context_text: requiredString(
          localizedValue(imageLocalized?.context_text, imageEnglish?.context_text),
          `${mechanics.case_id}.image.context_text`,
        ),
        target_anomalies: imageMechanics.target_anomalies.map((anomaly) => {
          const englishAnomaly = imageEnglish?.target_anomalies?.[anomaly.anomaly_id];
          const localizedAnomaly = imageLocalized?.target_anomalies?.[anomaly.anomaly_id];
          return {
            ...anomaly,
            description: requiredString(
              localizedValue(localizedAnomaly?.description, englishAnomaly?.description),
              `${mechanics.case_id}.${anomaly.anomaly_id}.description`,
            ),
            socratic_quiz: createQuiz(
              anomaly.socratic_quiz,
              englishAnomaly?.socratic_quiz,
              localizedAnomaly?.socratic_quiz,
              `${mechanics.case_id}.${anomaly.anomaly_id}.socratic_quiz`,
            ),
          };
        }),
        socratic_quiz: createQuiz(
          imageMechanics.socratic_quiz,
          imageEnglish?.socratic_quiz,
          imageLocalized?.socratic_quiz,
          `${mechanics.case_id}.image.socratic_quiz`,
        ),
      },
      step_2_text_highlight: {
        mechanic_type: textMechanics.mechanic_type,
        simulated_post: simulatedPost,
        traps: textMechanics.traps.map((trap) => {
          const englishTrap = textEnglish?.traps?.[trap.trap_id];
          const localizedTrap = textLocalized?.traps?.[trap.trap_id];
          return normalizeTrapOffsets(
            {
              trap_id: trap.trap_id,
              ground_truth_start: 0,
              ground_truth_end: 0,
              matched_text: requiredString(
                localizedValue(localizedTrap?.matched_text, englishTrap?.matched_text),
                `${mechanics.case_id}.${trap.trap_id}.matched_text`,
              ),
              weapon_type: trap.weapon_type,
              socratic_quiz: createQuiz(
                trap.socratic_quiz,
                englishTrap?.socratic_quiz,
                localizedTrap?.socratic_quiz,
                `${mechanics.case_id}.${trap.trap_id}.socratic_quiz`,
              ) as SocraticQuiz,
            },
            simulatedPost.content,
          );
        }),
      },
      step_3_sorting_game: {
        mechanic_type: sortingMechanics.mechanic_type,
        context_text: requiredString(
          localizedValue(sortingLocalized?.context_text, sortingEnglish?.context_text),
          `${mechanics.case_id}.sorting.context_text`,
        ),
        pool_items: sortingMechanics.pool_item_ids.map((itemId) => ({
          item_id: itemId,
          text: requiredString(
            localizedValue(sortingLocalized?.pool_items?.[itemId], sortingEnglish?.pool_items?.[itemId]),
            `${mechanics.case_id}.${itemId}`,
          ),
        })),
        correct_sequence: sortingMechanics.correct_sequence,
        validation_feedback: {
          success: requiredString(
            localizedValue(sortingLocalized?.validation_feedback?.success, sortingEnglish?.validation_feedback?.success),
            `${mechanics.case_id}.sorting.success`,
          ),
          failure: requiredString(
            localizedValue(sortingLocalized?.validation_feedback?.failure, sortingEnglish?.validation_feedback?.failure),
            `${mechanics.case_id}.sorting.failure`,
          ),
        },
      },
    },
    dialogue_trigger: {
      question: requiredString(
        localizedValue(localized?.dialogue_trigger?.question, english.dialogue_trigger?.question),
        `${mechanics.case_id}.dialogue.question`,
      ),
      mil_insight: requiredString(
        localizedValue(localized?.dialogue_trigger?.mil_insight, english.dialogue_trigger?.mil_insight),
        `${mechanics.case_id}.dialogue.mil_insight`,
      ),
    },
  };
}

async function readLocalizedCases(locale: Locale): Promise<CaseData[]> {
  const [englishResources, localizedResources] = await Promise.all([
    loadLocale("en"),
    loadLocale(locale),
  ]);
  const english = englishResources.cases as CaseTranslationCatalog;
  const localized = localizedResources.cases as CaseTranslationCatalog;
  return mechanicsCatalog.cases.map((mechanics) =>
    assembleCase(mechanics, english[mechanics.case_id], localized[mechanics.case_id]),
  );
}

export function getCases(locale: Locale = "en"): Promise<CaseData[]> {
  const cached = localizedCasesPromises.get(locale);
  if (cached) return cached;
  const cases = readLocalizedCases(locale);
  localizedCasesPromises.set(locale, cases);
  return cases;
}

export async function getCase(caseId: string, locale: Locale = "en"): Promise<CaseData | undefined> {
  return (await getCases(locale)).find((caseData) => caseData.case_id === caseId);
}
