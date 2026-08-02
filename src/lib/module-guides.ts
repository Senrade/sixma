export type ModuleGuideId =
  | "imageForensics"
  | "textHighlight"
  | "sortingGame";

export interface ModuleGuideDefinition {
  number: "01" | "02" | "03";
  title: string;
  summary: string;
  steps: readonly string[];
}

export const MODULE_GUIDES = {
  imageForensics: {
    number: "01",
    title: "Inspect the image",
    summary: "Mark a meaningful visual anomaly and explain why it matters.",
    steps: [
      "Inspect the whole image, then draw a circle around one suspicious area.",
      "Answer the evidence question to document the anomaly.",
    ],
  },
  textHighlight: {
    number: "02",
    title: "Analyze the language",
    summary: "Highlight the exact passage that uses a persuasive trap.",
    steps: [
      "Select the smallest complete passage that contains the manipulation.",
      "Confirm the highlight, then answer the critical-thinking question.",
    ],
  },
  sortingGame: {
    number: "03",
    title: "Reconstruct the chain",
    summary: "Place each stage of the manipulation in chronological order.",
    steps: [
      "Tap or drag each evidence item into a numbered timeline slot.",
      "Reorder the timeline, submit it, and revise it if the sequence is incorrect.",
    ],
  },
} as const satisfies Record<ModuleGuideId, ModuleGuideDefinition>;

export const MODULE_GUIDE_LIST: readonly ModuleGuideDefinition[] = [
  MODULE_GUIDES.imageForensics,
  MODULE_GUIDES.textHighlight,
  MODULE_GUIDES.sortingGame,
];
