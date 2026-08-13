export type ModuleGuideId =
  | "imageForensics"
  | "textHighlight"
  | "sortingGame";

export interface ModuleGuideDefinition {
  number: "01" | "02" | "03";
  title: MessageKey;
  summary: MessageKey;
  steps: readonly MessageKey[];
}

export const MODULE_GUIDES = {
  imageForensics: {
    number: "01",
    title: "module.image.title",
    summary: "module.image.summary",
    steps: [
      "module.image.step1",
      "module.image.step2",
    ],
  },
  textHighlight: {
    number: "02",
    title: "module.text.title",
    summary: "module.text.summary",
    steps: [
      "module.text.step1",
      "module.text.step2",
    ],
  },
  sortingGame: {
    number: "03",
    title: "module.sort.title",
    summary: "module.sort.summary",
    steps: [
      "module.sort.step1",
      "module.sort.step2",
    ],
  },
} as const satisfies Record<ModuleGuideId, ModuleGuideDefinition>;

export const MODULE_GUIDE_LIST: readonly ModuleGuideDefinition[] = [
  MODULE_GUIDES.imageForensics,
  MODULE_GUIDES.textHighlight,
  MODULE_GUIDES.sortingGame,
];
import type { MessageKey } from "@/i18n/messages/types";
