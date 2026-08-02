import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import type { ModuleGuideDefinition } from "@/lib/module-guides";
import { ModuleGuide } from "./ModuleGuide";
import { RetroWindow } from "./RetroWindow";
import {
  gameButton,
  gameFeedbackError,
  gameFeedbackSuccess,
  gamePanel,
  gameSectionBar,
} from "./moduleStyles";

export interface SortingValidationFeedback {
  success: string;
  failure: string;
}

export interface SortingGameProps {
  guide: ModuleGuideDefinition;
  contextText: string;
  poolItems: { id: string; text: string }[];
  correctSequence?: string[];
  validationFeedback?: SortingValidationFeedback;
  onSort?: (sequence: string[]) => void;
  onComplete?: () => void;
}

type SortStatus = "Ready" | "Incorrect" | "Correct";
const POINTER_DRAG_THRESHOLD_PX = 8;

function isCompleteSequence(sequence: (string | null)[]): sequence is string[] {
  return sequence.every((itemId): itemId is string => itemId !== null);
}

export function SortingGame({
  guide,
  contextText,
  poolItems,
  correctSequence,
  validationFeedback,
  onSort,
  onComplete,
}: SortingGameProps) {
  const [sequence, setSequence] = useState<(string | null)[]>(() =>
    Array.from({ length: poolItems.length }, () => null),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragTargetIndex, setDragTargetIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<SortStatus>("Ready");
  const [feedback, setFeedback] = useState("");

  const pointerMovedRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const completionSentRef = useRef(false);
  const suppressNextSlotClickRef = useRef(false);

  const expectedSequence = correctSequence ?? poolItems.map((item) => item.id);
  const placedIds = new Set(
    sequence.filter((itemId): itemId is string => itemId !== null),
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSequence(Array.from({ length: poolItems.length }, () => null));
      setSelectedId(null);
      setDraggingId(null);
      setDragTargetIndex(null);
      setStatus("Ready");
      setFeedback("");
      completionSentRef.current = false;
    }, 0);

    return () => window.clearTimeout(timer);
  }, [poolItems, correctSequence]);

  const getSlotIndexFromPoint = (
    clientX: number,
    clientY: number,
  ): number | null => {
    const element = document.elementFromPoint(clientX, clientY);
    const slot = element?.closest<HTMLElement>("[data-slot-index]");
    const index = slot?.dataset.slotIndex;

    if (index === undefined) {
      return null;
    }

    const parsedIndex = Number(index);
    return Number.isInteger(parsedIndex) ? parsedIndex : null;
  };

  const validateSequence = (candidate: string[]) => {
    const correct =
      candidate.length === expectedSequence.length &&
      expectedSequence.every((itemId, index) => itemId === candidate[index]);

    setStatus(correct ? "Correct" : "Incorrect");
    setFeedback(
      correct
        ? validationFeedback?.success ?? "Correct sequence."
        : validationFeedback?.failure ?? "That sequence is not correct yet.",
    );
    onSort?.(candidate);

  };

  const handleComplete = () => {
    if (status !== "Correct" || completionSentRef.current) {
      return;
    }

    completionSentRef.current = true;
    onComplete?.();
  };

  const removeItem = (itemId: string) => {
    const previousIndex = sequence.indexOf(itemId);
    if (previousIndex !== -1) {
      const nextSequence = [...sequence];
      nextSequence[previousIndex] = null;
      setSequence(nextSequence);
      setStatus("Ready");
      setFeedback("");
    }
    setSelectedId(null);
    setDraggingId(null);
    setDragTargetIndex(null);
  };

  const placeItemAt = (itemId: string, targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= poolItems.length) {
      return;
    }

    const previousIndex = sequence.indexOf(itemId);

    // Dropping an item onto its current slot removes it from the timeline.
    if (previousIndex === targetIndex) {
      removeItem(itemId);
      return;
    }

    const nextSequence = [...sequence];
    const displacedId = nextSequence[targetIndex];

    if (previousIndex !== -1) {
      nextSequence[previousIndex] = displacedId ?? null;
    }

    nextSequence[targetIndex] = itemId;
    setSequence(nextSequence);
    setSelectedId(null);
    setDraggingId(null);
    setDragTargetIndex(null);

    if (isCompleteSequence(nextSequence)) {
      validateSequence(nextSequence);
    } else {
      setStatus("Ready");
      setFeedback("");
    }
  };

  const handlePointerDown = (
    itemId: string,
    event: PointerEvent<HTMLDivElement>,
  ) => {
    const usingDragHandle =
      event.target instanceof Element &&
      event.target.closest("[data-drag-handle]") !== null;

    setSelectedId((prev) =>
      usingDragHandle ? itemId : prev === itemId ? null : itemId,
    );

    if (event.pointerType === "mouse") {
      return;
    }

    if (!usingDragHandle) {
      return;
    }

    event.preventDefault();
    pointerMovedRef.current = false;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    setDraggingId(itemId);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingId || !pointerStartRef.current) {
      return;
    }

    if (!pointerMovedRef.current) {
      const distance = Math.hypot(
        event.clientX - pointerStartRef.current.x,
        event.clientY - pointerStartRef.current.y,
      );

      if (distance < POINTER_DRAG_THRESHOLD_PX) {
        return;
      }
    }

    event.preventDefault();
    pointerMovedRef.current = true;
    setDragTargetIndex(getSlotIndexFromPoint(event.clientX, event.clientY));
  };

  const handlePointerUp = (
    itemId: string,
    event: PointerEvent<HTMLDivElement>,
  ) => {
    if (event.pointerType === "mouse") {
      return;
    }

    const pointerMoved = pointerMovedRef.current;
    const targetIndex = getSlotIndexFromPoint(event.clientX, event.clientY);

    if (pointerMoved && targetIndex !== null) {
      placeItemAt(itemId, targetIndex);
    } else if (pointerMoved) {
      // Dropping outside the timeline returns the item to the evidence bank.
      removeItem(itemId);
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    suppressNextSlotClickRef.current = pointerMoved;
    if (pointerMoved) {
      window.setTimeout(() => {
        suppressNextSlotClickRef.current = false;
      }, 0);
    }
    pointerMovedRef.current = false;
    pointerStartRef.current = null;
    setDraggingId(null);
    setDragTargetIndex(null);
  };

  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    pointerMovedRef.current = false;
    pointerStartRef.current = null;
    suppressNextSlotClickRef.current = false;
    setDraggingId(null);
    setDragTargetIndex(null);
  };

  const handleDragStart = (
    itemId: string,
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", itemId);
    setSelectedId(itemId);
    setDraggingId(itemId);
  };

  const handleDrop = (
    targetIndex: number,
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    const droppedId = event.dataTransfer.getData("text/plain") || draggingId;

    if (droppedId) {
      placeItemAt(droppedId, targetIndex);
    }
  };

  const handleItemKeyDown = (
    itemId: string,
    event: KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedId((prev) => (prev === itemId ? null : itemId));
    }
  };

  const handleSlotClick = (slotIndex: number) => {
    if (suppressNextSlotClickRef.current) {
      suppressNextSlotClickRef.current = false;
      return;
    }

    if (selectedId) {
      placeItemAt(selectedId, slotIndex);
      return;
    }

    const itemId = sequence[slotIndex];
    if (itemId) {
      setSelectedId(itemId);
    }
  };

  const handleSlotKeyDown = (
    slotIndex: number,
    event: KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSlotClick(slotIndex);
    }
  };

  return (
    <RetroWindow title="Module 03 / Sequence Reconstruction">
      <ModuleGuide guide={guide} />
      <div className="mb-4 border-l-4 border-danger bg-accent/25 px-4 py-3">
        <p className="font-mono text-[11px] font-black uppercase text-danger">Case context</p>
        <p className="mt-1 text-sm font-bold leading-6 text-ink">{contextText}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {/* EVIDENCE BANK CONTAINER */}
        <div
          className={gamePanel}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const droppedId = e.dataTransfer.getData("text/plain") || draggingId;
            if (droppedId) {
              removeItem(droppedId);
            }
          }}
        >
          <div className={gameSectionBar}>
            EVIDENCE BANK
          </div>
          <div className="space-y-1">
            {poolItems.map((item) => {
              const isPlaced = placedIds.has(item.id);
              const isSelected = selectedId === item.id;

              return (
                <div
                  key={item.id}
                  draggable
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onPointerDown={(event) => handlePointerDown(item.id, event)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={(event) => handlePointerUp(item.id, event)}
                  onPointerCancel={handlePointerCancel}
                  onDragStart={(event) => handleDragStart(item.id, event)}
                  onDragEnd={() => {
                    pointerStartRef.current = null;
                    setDraggingId(null);
                    setDragTargetIndex(null);
                  }}
                  onKeyDown={(event) => handleItemKeyDown(item.id, event)}
                  className={`flex min-h-14 cursor-pointer touch-pan-y items-center gap-2 rounded-[6px] border-2 border-ink bg-background px-3 py-3 text-sm leading-6 text-ink shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:-translate-y-px sm:min-h-12 sm:gap-3 sm:py-2 ${
                    isPlaced ? "opacity-60" : ""
                  } ${isSelected ? "bg-accent outline-2 outline-offset-2 outline-info" : ""}`}
                >
                  <span
                    data-drag-handle
                    aria-hidden
                    className="grid h-9 w-7 shrink-0 touch-none cursor-grab place-items-center rounded-[4px] border-2 border-ink bg-surface-2 font-mono text-xs font-black active:cursor-grabbing"
                  >
                    ::
                  </span>
                  <span className="flex-1">{item.text}</span>
                  <span className="hidden rounded-[4px] border-2 border-ink bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink-soft sm:inline-flex">
                    {item.id}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* TIMELINE CONTAINER */}
        <div className={gamePanel}>
          <div className={gameSectionBar}>
            TIMELINE
          </div>
          <div className="space-y-1">
            {sequence.map((itemId, index) => {
              const item = poolItems.find((poolItem) => poolItem.id === itemId);
              const isDropTarget = dragTargetIndex === index;

              return (
                <div
                  key={index}
                  data-slot-index={index}
                  draggable={Boolean(item)}
                  role="button"
                  tabIndex={0}
                  onPointerDown={
                    item
                      ? (event) => handlePointerDown(item.id, event)
                      : undefined
                  }
                  onPointerMove={item ? handlePointerMove : undefined}
                  onPointerUp={
                    item
                      ? (event) => handlePointerUp(item.id, event)
                      : undefined
                  }
                  onPointerCancel={item ? handlePointerCancel : undefined}
                  onClick={() => handleSlotClick(index)}
                  onKeyDown={(event) => handleSlotKeyDown(index, event)}
                  onDragOver={(event) => {
                    event.preventDefault();
                  }}
                  onDragLeave={(event) => {
                    if (
                      event.currentTarget.contains(
                        event.relatedTarget as Node,
                      )
                    ) {
                      return;
                    }
                    setDragTargetIndex((prev) =>
                      prev === index ? null : prev,
                    );
                  }}
                  onDrop={(event) => handleDrop(index, event)}
                  onDragStart={
                    item
                      ? (event) => handleDragStart(item.id, event)
                      : undefined
                  }
                  onDragEnd={
                    item
                      ? () => {
                          pointerStartRef.current = null;
                          setDraggingId(null);
                          setDragTargetIndex(null);
                        }
                      : undefined
                  }
                  className={`flex min-h-16 cursor-pointer touch-pan-y items-center gap-2 rounded-[6px] border-2 border-dashed border-ink bg-surface-2 px-3 py-3 text-sm leading-6 text-ink-soft transition-colors sm:min-h-14 sm:gap-3 sm:py-2 ${
                    isDropTarget ? "bg-accent outline-2 outline-offset-2 outline-info" : ""
                  }`}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[4px] border-2 border-ink bg-info font-mono text-xs font-black text-info-foreground">
                    {index + 1}
                  </span>
                  {item ? (
                    <>
                      <span
                        data-drag-handle
                        aria-hidden
                        className="grid h-9 w-7 shrink-0 touch-none cursor-grab place-items-center rounded-[4px] border-2 border-ink bg-background font-mono text-xs font-black text-ink active:cursor-grabbing"
                      >
                        ::
                      </span>
                      <span className="flex-1 text-ink">{item.text}</span>
                    </>
                  ) : (
                    <span className="italic">Drop here</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-[6px] border-2 border-ink bg-surface-2 px-3 py-2 font-mono text-xs font-bold text-ink-soft">
        <span>Items: {poolItems.length}</span>
        <span role="status" aria-live="polite">
          Status: {status}
        </span>
      </div>
      {feedback && (
        <p
          className={`mt-3 ${status === "Correct" ? gameFeedbackSuccess : gameFeedbackError}`}
          role="status"
          aria-live="polite"
        >
          {feedback}
        </p>
      )}
      {status === "Correct" && (
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={handleComplete} className={gameButton}>
            Complete investigation
          </button>
        </div>
      )}
    </RetroWindow>
  );
}

export default SortingGame;
