export const SPECIAL_EVENT_CASE_ID = "S005";
export const DEMO_EVENT_BADGE_ID = "signal-breaker";
export const ACTIVE_DEMO_EVENT_CARD_ID = "fear-appeal";

export const DEMO_EVENT_ACCESS_STORAGE_KEY =
  "sixma-demo-event:v1:access:S005";
export const DEMO_EVENT_BADGE_STORAGE_KEY =
  "sixma-demo-event:v1:badge:signal-breaker";

export interface DemoEventCard {
  id: string;
  name: string;
  code: string;
  artworkUrl: string;
}

export const DEMO_EVENT_CARDS = [
  {
    id: "fear-appeal",
    name: "Fear Appeal",
    code: "WX7-89S-IDK",
    artworkUrl: "/assets/cards/card-1.svg",
  },
  {
    id: "cognitive-pause",
    name: "Cognitive Pause",
    code: "K4M-7QX-2RP",
    artworkUrl: "/assets/cards/card-2.svg",
  },
  {
    id: "domain-spoof",
    name: "Domain Spoof",
    code: "N8V-3HC-6TY",
    artworkUrl: "/assets/cards/card-3.svg",
  },
  {
    id: "lateral-check",
    name: "Lateral Check",
    code: "G5R-W9K-4AZ",
    artworkUrl: "/assets/cards/card-4.svg",
  },
  {
    id: "fake-news",
    name: "Fake News",
    code: "P2D-8LF-X7M",
    artworkUrl: "/assets/cards/card-5.svg",
  },
  {
    id: "domain-audit",
    name: "Domain Audit",
    code: "T6Y-C3N-9QH",
    artworkUrl: "/assets/cards/card-6.svg",
  },
] as const satisfies readonly DemoEventCard[];

export type DemoEventCardId = (typeof DEMO_EVENT_CARDS)[number]["id"];

export function normalizeDemoEventCode(value: string): string {
  const characters = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 9);
  return characters.match(/.{1,3}/g)?.join("-") ?? "";
}

export function findRedeemableDemoEventCard(value: string): DemoEventCard | undefined {
  const code = normalizeDemoEventCode(value);
  return DEMO_EVENT_CARDS.find(
    (card) => card.id === ACTIVE_DEMO_EVENT_CARD_ID && card.code === code,
  );
}

export function getDemoEventCard(cardId: string): DemoEventCard | undefined {
  return DEMO_EVENT_CARDS.find((card) => card.id === cardId);
}

export function getActiveDemoEventCard(): DemoEventCard {
  const card = getDemoEventCard(ACTIVE_DEMO_EVENT_CARD_ID);
  if (!card) throw new Error("The active demo event card is missing from the catalog.");
  return card;
}
