export interface SocraticQuizTranslation {
  question?: string;
  push_question?: string;
  options?: string[];
  explanation?: string;
}

export interface CaseTranslation {
  title?: string;
  short_summary?: string;
  skills?: string[];
  theme?: string[];
  story_context?: string;
  source?: {
    title?: string;
    note?: string;
  };
  modules?: {
    step_1_image_forensics?: {
      context_text?: string;
      target_anomalies?: Record<string, {
        description?: string;
        socratic_quiz?: SocraticQuizTranslation;
      }>;
      socratic_quiz?: SocraticQuizTranslation;
    };
    step_2_text_highlight?: {
      simulated_post?: {
        author?: string;
        time_posted?: string;
        content?: string;
      };
      traps?: Record<string, {
        matched_text?: string;
        socratic_quiz?: SocraticQuizTranslation;
      }>;
    };
    step_3_sorting_game?: {
      context_text?: string;
      pool_items?: Record<string, string>;
      validation_feedback?: {
        success?: string;
        failure?: string;
      };
    };
  };
  dialogue_trigger?: {
    question?: string;
    mil_insight?: string;
  };
}

export type CaseTranslationCatalog = Record<string, CaseTranslation>;
