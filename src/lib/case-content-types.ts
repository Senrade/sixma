import type { CaseLevel } from "./case-types";

export interface QuizMechanics {
  correct_option?: string;
}

export interface CaseMechanics {
  level: CaseLevel;
  case_id: string;
  duration_min: number;
  spotted_url: string;
  source?: {
    title: string;
    url: string;
  };
  modules: {
    step_1_image_forensics: {
      mechanic_type: "IMAGE_FORENSICS";
      image_url: string;
      image_width?: number;
      image_height?: number;
      target_anomalies: Array<{
        anomaly_id: string;
        name: string;
        x_pct: number;
        y_pct: number;
        radius_pct: number;
        socratic_quiz?: QuizMechanics;
      }>;
      socratic_quiz?: QuizMechanics;
    };
    step_2_text_highlight: {
      mechanic_type: "TEXT_HIGHLIGHT";
      traps: Array<{
        trap_id: string;
        weapon_type: string[];
        socratic_quiz: QuizMechanics;
      }>;
    };
    step_3_sorting_game: {
      mechanic_type: "DRAG_AND_DROP_SORTING";
      pool_item_ids: string[];
      correct_sequence: string[];
    };
  };
}

export interface CaseMechanicsCatalog {
  schema_version: 1;
  cases: CaseMechanics[];
}
