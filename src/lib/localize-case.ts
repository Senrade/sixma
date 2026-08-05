import type {
  CaseData,
  CaseTranslation,
  LocalizableCaseData,
  SocraticQuiz,
  SocraticQuizTranslation,
} from "./case-types";

export type CaseLocale = "vi" | "en";

function localizeQuiz(
  quiz: SocraticQuiz,
  translation: SocraticQuizTranslation | undefined,
): SocraticQuiz {
  if (!translation) return quiz;

  return {
    ...quiz,
    ...translation,
  };
}

function getUniqueMatchRange(content: string, matchedText: string) {
  const start = content.indexOf(matchedText);
  const duplicateStart = content.indexOf(matchedText, start + 1);

  if (start < 0 || duplicateStart >= 0) {
    throw new Error(
      `Highlight text must occur exactly once in its localized post: "${matchedText}"`,
    );
  }

  return { start, end: start + matchedText.length };
}

export function localizeCase(
  caseData: LocalizableCaseData,
  locale: CaseLocale,
): CaseData {
  if (locale === "en") return caseData;

  const translation = caseData.translations[locale];
  const imageModule = caseData.modules.step_1_image_forensics;
  const textModule = caseData.modules.step_2_text_highlight;
  const sortingModule = caseData.modules.step_3_sorting_game;

  return {
    ...caseData,
    title: translation.title,
    short_summary: translation.short_summary,
    skills: translation.skills,
    theme: translation.theme,
    story_context: translation.story_context,
    source:
      caseData.source && translation.source
        ? { ...caseData.source, note: translation.source.note }
        : caseData.source,
    modules: {
      step_1_image_forensics: {
        ...imageModule,
        context_text: translation.modules.step_1_image_forensics.context_text,
        target_anomalies: imageModule.target_anomalies.map((anomaly) => {
          const translatedAnomaly =
            translation.modules.step_1_image_forensics.target_anomalies[
              anomaly.anomaly_id
            ];

          return {
            ...anomaly,
            description: translatedAnomaly.description,
            socratic_quiz: anomaly.socratic_quiz
              ? localizeQuiz(
                  anomaly.socratic_quiz,
                  translatedAnomaly.socratic_quiz,
                )
              : undefined,
          };
        }),
      },
      step_2_text_highlight: {
        ...textModule,
        simulated_post:
          translation.modules.step_2_text_highlight.simulated_post,
        traps: textModule.traps.map((trap) => {
          const translatedTrap =
            translation.modules.step_2_text_highlight.traps[trap.trap_id];
          const range = getUniqueMatchRange(
            translation.modules.step_2_text_highlight.simulated_post.content,
            translatedTrap.matched_text,
          );

          return {
            ...trap,
            ground_truth_start: range.start,
            ground_truth_end: range.end,
            matched_text: translatedTrap.matched_text,
            socratic_quiz: localizeQuiz(
              trap.socratic_quiz,
              translatedTrap.socratic_quiz,
            ),
          };
        }),
      },
      step_3_sorting_game: {
        ...sortingModule,
        context_text: translation.modules.step_3_sorting_game.context_text,
        pool_items: sortingModule.pool_items.map((item) => ({
          ...item,
          text: translation.modules.step_3_sorting_game.pool_items[item.item_id],
        })),
        validation_feedback:
          translation.modules.step_3_sorting_game.validation_feedback,
      },
    },
    dialogue_trigger: translation.dialogue_trigger,
  };
}

export function localizeCases(
  cases: LocalizableCaseData[],
  locale: CaseLocale,
): CaseData[] {
  return cases.map((caseData) => localizeCase(caseData, locale));
}

export function validateCaseTranslations(caseData: LocalizableCaseData): void {
  const translation: CaseTranslation = caseData.translations.vi;
  const translatedImageAnomalies =
    translation.modules.step_1_image_forensics.target_anomalies;
  const translatedTraps = translation.modules.step_2_text_highlight.traps;
  const translatedPoolItems =
    translation.modules.step_3_sorting_game.pool_items;

  for (const anomaly of caseData.modules.step_1_image_forensics.target_anomalies) {
    if (!translatedImageAnomalies[anomaly.anomaly_id]) {
      throw new Error(
        `Missing Vietnamese translation for anomaly ${anomaly.anomaly_id}.`,
      );
    }
  }

  for (const trap of caseData.modules.step_2_text_highlight.traps) {
    const translatedTrap = translatedTraps[trap.trap_id];
    if (!translatedTrap) {
      throw new Error(`Missing Vietnamese translation for trap ${trap.trap_id}.`);
    }
    getUniqueMatchRange(
      translation.modules.step_2_text_highlight.simulated_post.content,
      translatedTrap.matched_text,
    );
  }

  for (const item of caseData.modules.step_3_sorting_game.pool_items) {
    if (!translatedPoolItems[item.item_id]) {
      throw new Error(
        `Missing Vietnamese translation for sorting item ${item.item_id}.`,
      );
    }
  }
}
