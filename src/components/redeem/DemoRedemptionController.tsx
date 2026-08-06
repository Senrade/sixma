"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  findDemoEventCard,
  getDemoEventCard,
  normalizeDemoEventCode,
} from "@/lib/demo-event";
import {
  readDemoEventAccess,
  redeemDemoEventCard,
} from "@/lib/demo-event-storage";
import {
  DemoRedemptionView,
  type RedemptionViewState,
} from "./DemoRedemptionView";

export function DemoRedemptionController() {
  const [code, setCode] = useState("");
  const [viewState, setViewState] = useState<RedemptionViewState>({ kind: "ready" });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const access = readDemoEventAccess();
      const card = access ? getDemoEventCard(access.cardId) : undefined;
      if (card) setViewState({ kind: "already-unlocked", card });
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleCodeChange = (value: string) => {
    setCode(normalizeDemoEventCode(value));
    if (viewState.kind === "invalid" || viewState.kind === "storage-unavailable") {
      setViewState({ kind: "ready" });
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const card = findDemoEventCard(code);
    if (!card) {
      setViewState({ kind: "invalid" });
      return;
    }

    const result = redeemDemoEventCard(card);
    if (result.status === "storage-unavailable") {
      setViewState({ kind: "storage-unavailable" });
      return;
    }

    const redeemedCard = getDemoEventCard(result.access.cardId) ?? card;
    setViewState({ kind: result.status, card: redeemedCard });
  };

  return (
    <DemoRedemptionView
      code={code}
      state={viewState}
      onCodeChange={handleCodeChange}
      onSubmit={handleSubmit}
    />
  );
}
