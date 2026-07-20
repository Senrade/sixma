import {
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { RetroWindow } from "./RetroWindow";

export interface SortingValidationFeedback {
  success: string;
  failure: string;
}

export interface SortingGameProps {
  poolItems: { id: string; text: string }[];
  correctSequence?: string[];
  validationFeedback?: SortingValidationFeedback;
  onSort?: (sequence: string[]) => void;
  onComplete?: () => void;
}

type SortStatus = "Ready" | "Incorrect" | "Correct";

function isCompleteSequence(sequence: (string | null)[]): sequence is string[] {
  return sequence.every((itemId): itemId is string => itemId !== null);
}

export function SortingGame({
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
  const completionSentRef = useRef(false);

  const expectedSequence = correctSequence ?? poolItems.map((item) => item.id);
  const placedIds = new Set(sequence.filter((itemId): itemId is string => itemId !== null));

  const getSlotIndexFromPoint = (clientX: number, clientY: number): number | null => {
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

    if (correct && !completionSentRef.current) {
      completionSentRef.current = true;
      onComplete?.();
    }
  };

  const placeItemAt = (itemId: string, targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= poolItems.length) {
      return;
    }

    const nextSequence = [...sequence];
    const previousIndex = nextSequence.indexOf(itemId);
    const displacedId = nextSequence[targetIndex];

    if (previousIndex !== -1 && previousIndex !== targetIndex) {
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
    setSelectedId(itemId);

    if (event.pointerType === "mouse") {
      return;
    }

    event.preventDefault();
    pointerMovedRef.current = false;
    setDraggingId(itemId);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingId) {
      return;
    }

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

    const targetIndex = getSlotIndexFromPoint(event.clientX, event.clientY);

    if (pointerMovedRef.current && targetIndex !== null) {
      placeItemAt(itemId, targetIndex);
    } else {
      setSelectedId(itemId);
      setDraggingId(null);
      setDragTargetIndex(null);
    }

    pointerMovedRef.current = false;
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
      setSelectedId(itemId);
    }
  };

  const handleSlotClick = (slotIndex: number) => {
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
    <RetroWindow title="Sort.exe ” Sequence Builder">
      <div className="grid gap-2 md:grid-cols-2">
        <div className="bg-[#c0c0c0] p-2 shadow-[inset_2px_2px_0_#808080,inset_-1px_-1px_0_#fff]">
          <div className="mb-2 bg-[#000080] px-1 py-0.5 text-[10px] font-bold text-white">
            â–¼ EVIDENCE BANK
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
                  onPointerCancel={() => {
                    setDraggingId(null);
                    setDragTargetIndex(null);
                  }}
                  onDragStart={(event) => handleDragStart(item.id, event)}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setDragTargetIndex(null);
                  }}
                  onKeyDown={(event) => handleItemKeyDown(item.id, event)}
                  className={`flex cursor-grab items-center gap-2 bg-[#c0c0c0] px-2 py-1 text-xs shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#fff,inset_-2px_-2px_0_#808080,inset_2px_2px_0_#dfdfdf] active:cursor-grabbing ${isPlaced ? "opacity-60" : ""} ${isSelected ? "ring-2 ring-[#000080]" : ""}`}
                >
                  <span className="text-[10px] text-[#606060]">â‰¡</span>
                  <span className="flex-1">{item.text}</span>
                  <span className="bg-white px-1 text-[10px] text-[#606060] shadow-[inset_1px_1px_0_#808080]">
                    {item.id}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#c0c0c0] p-2 shadow-[inset_2px_2px_0_#808080,inset_-1px_-1px_0_#fff]">
          <div className="mb-2 bg-[#000080] px-1 py-0.5 text-[10px] font-bold text-white">
            â–¼ TIMELINE
          </div>
          <div className="space-y-1">
            {sequence.map((itemId, index) => {
              const item = poolItems.find((poolItem) => poolItem.id === itemId);
              const isDropTarget = dragTargetIndex === index;

              return (
                <div
                  key={index}
                  data-slot-index={index}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSlotClick(index)}
                  onKeyDown={(event) => handleSlotKeyDown(index, event)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragTargetIndex(index);
                  }}
                  onDrop={(event) => handleDrop(index, event)}
                  className={`flex min-h-[34px] items-center gap-2 border-2 border-dashed border-[#808080] bg-white/50 px-2 py-2 text-xs text-[#808080] ${isDropTarget ? "ring-2 ring-[#000080]" : ""}`}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-[#000080] text-[10px] font-bold text-white">
                    {index + 1}
                  </span>
                  {item ? (
                    <span className="flex-1 text-black">{item.text}</span>
                  ) : (
                    <span className="italic">”drop here”</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between bg-[#c0c0c0] px-2 py-1 text-[10px] shadow-[inset_1px_1px_0_#808080,inset_-1px_-1px_0_#fff]">
        <span>Items: {poolItems.length}</span>
        <span role="status" aria-live="polite">
          Status: {status}
        </span>
      </div>
      {feedback && (
        <p
          className={`mt-2 p-2 text-xs ${status === "Correct" ? "bg-[#d7ffd7]" : "bg-[#ffd7d7]"}`}
          role="status"
          aria-live="polite"
        >
          {feedback}
        </p>
      )}
    </RetroWindow>
  );
}

export default SortingGame;
