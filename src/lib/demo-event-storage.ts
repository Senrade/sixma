"use client";

import {
  DEMO_EVENT_ACCESS_STORAGE_KEY,
  DEMO_EVENT_BADGE_ID,
  DEMO_EVENT_BADGE_STORAGE_KEY,
  SPECIAL_EVENT_CASE_ID,
  getDemoEventCard,
  type DemoEventCard,
  type DemoEventCardId,
} from "./demo-event";

interface DemoEventAccessRecord {
  version: 1;
  caseId: typeof SPECIAL_EVENT_CASE_ID;
  cardId: DemoEventCardId;
  redeemedAt: string;
}

interface DemoEventBadgeRecord {
  version: 1;
  badgeId: typeof DEMO_EVENT_BADGE_ID;
  caseId: typeof SPECIAL_EVENT_CASE_ID;
  earnedAt: string;
}

export type DemoRedemptionResult =
  | { status: "unlocked"; access: DemoEventAccessRecord }
  | { status: "already-unlocked"; access: DemoEventAccessRecord }
  | { status: "storage-unavailable" };

function parseAccessRecord(value: string | null): DemoEventAccessRecord | null {
  if (!value) return null;

  try {
    const record: unknown = JSON.parse(value);
    if (
      typeof record === "object" &&
      record !== null &&
      "version" in record &&
      record.version === 1 &&
      "caseId" in record &&
      record.caseId === SPECIAL_EVENT_CASE_ID &&
      "cardId" in record &&
      typeof record.cardId === "string" &&
      getDemoEventCard(record.cardId) &&
      "redeemedAt" in record &&
      typeof record.redeemedAt === "string"
    ) {
      return record as DemoEventAccessRecord;
    }
  } catch {
    return null;
  }

  return null;
}

function parseBadgeRecord(value: string | null): DemoEventBadgeRecord | null {
  if (!value) return null;

  try {
    const record: unknown = JSON.parse(value);
    if (
      typeof record === "object" &&
      record !== null &&
      "version" in record &&
      record.version === 1 &&
      "badgeId" in record &&
      record.badgeId === DEMO_EVENT_BADGE_ID &&
      "caseId" in record &&
      record.caseId === SPECIAL_EVENT_CASE_ID &&
      "earnedAt" in record &&
      typeof record.earnedAt === "string"
    ) {
      return record as DemoEventBadgeRecord;
    }
  } catch {
    return null;
  }

  return null;
}

export function readDemoEventAccess(): DemoEventAccessRecord | null {
  try {
    return parseAccessRecord(
      window.localStorage.getItem(DEMO_EVENT_ACCESS_STORAGE_KEY),
    );
  } catch {
    return null;
  }
}

export function hasDemoEventAccess(): boolean {
  return readDemoEventAccess() !== null;
}

export function redeemDemoEventCard(card: DemoEventCard): DemoRedemptionResult {
  const existing = readDemoEventAccess();
  if (existing) return { status: "already-unlocked", access: existing };

  const access: DemoEventAccessRecord = {
    version: 1,
    caseId: SPECIAL_EVENT_CASE_ID,
    cardId: card.id as DemoEventCardId,
    redeemedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(
      DEMO_EVENT_ACCESS_STORAGE_KEY,
      JSON.stringify(access),
    );
    return { status: "unlocked", access };
  } catch {
    return { status: "storage-unavailable" };
  }
}

export function readDemoEventBadge(): DemoEventBadgeRecord | null {
  try {
    return parseBadgeRecord(
      window.localStorage.getItem(DEMO_EVENT_BADGE_STORAGE_KEY),
    );
  } catch {
    return null;
  }
}

export function awardDemoEventBadge(): boolean {
  if (readDemoEventBadge()) return false;

  const badge: DemoEventBadgeRecord = {
    version: 1,
    badgeId: DEMO_EVENT_BADGE_ID,
    caseId: SPECIAL_EVENT_CASE_ID,
    earnedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(
      DEMO_EVENT_BADGE_STORAGE_KEY,
      JSON.stringify(badge),
    );
    return true;
  } catch {
    return false;
  }
}
