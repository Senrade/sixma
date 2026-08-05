export type CaseLevel = "RED" | "AMBER" | "GREEN";

export interface SocraticQuiz {
  question?: string;
  push_question?: string;
  options: string[];
  correct_option?: string;
  explanation?: string;
}

export interface ImageAnomaly {
  anomaly_id: string;
  name: string;
  x_pct: number;
  y_pct: number;
  radius_pct: number;
  description: string;
  socratic_quiz?: SocraticQuiz;
}

export interface ImageForensicsModule {
  mechanic_type: "IMAGE_FORENSICS";
  image_url: string;
  image_width?: number;
  image_height?: number;
  context_text: string;
  target_anomalies: ImageAnomaly[];
  socratic_quiz?: SocraticQuiz;
}

export interface TextHighlightTrap {
  trap_id: string;
  ground_truth_start: number;
  ground_truth_end: number;
  matched_text: string;
  weapon_type: string[];
  socratic_quiz: SocraticQuiz;
}

export interface TextHighlightModule {
  mechanic_type: "TEXT_HIGHLIGHT";
  simulated_post: {
    author: string;
    time_posted: string;
    content: string;
  };
  traps: TextHighlightTrap[];
}

export interface SortingPoolItem {
  item_id: string;
  text: string;
}

export interface SortingModule {
  mechanic_type: "DRAG_AND_DROP_SORTING";
  context_text: string;
  pool_items: SortingPoolItem[];
  correct_sequence: string[];
  validation_feedback: {
    success: string;
    failure: string;
  };
}

export interface CaseData {
  level: CaseLevel;
  case_id: string;
  title: string;
  short_summary: string;
  duration_min: number;
  skills: string[];
  spotted_url: string;
  theme: string[];
  story_context: string;
  source?: {
    title: string;
    url: string;
    note: string;
  };
  modules: {
    step_1_image_forensics: ImageForensicsModule;
    step_2_text_highlight: TextHighlightModule;
    step_3_sorting_game: SortingModule;
  };
  dialogue_trigger: {
    question: string;
    mil_insight: string;
  };
}
