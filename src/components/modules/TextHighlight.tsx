import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent,
} from "react";
import type { ModuleGuideDefinition } from "@/lib/module-guides";
import { ModuleGuide } from "./ModuleGuide";
import { RetroWindow } from "./RetroWindow";
import {
  gameButton,
  gameButtonSecondary,
  gameFeedbackError,
  gameFeedbackSuccess,
  gameOption,
  gamePanel,
  gameSectionBar,
} from "./moduleStyles";

export interface TextHighlightQuiz {
  question?: string;
  push_question?: string;
  options: string[];
  correct_option?: string;
  explanation?: string;
}

export interface TextHighlightTrap {
  trap_id: string;
  ground_truth_start: number;
  ground_truth_end: number;
  matched_text: string;
  weapon_type: string[];
  socratic_quiz: TextHighlightQuiz;
}

export interface TextHighlightProps {
  guide: ModuleGuideDefinition;
  postAuthor: string;
  postTime: string;
  content: string;
  traps?: TextHighlightTrap[];
  iouThreshold?: number;
  socraticQuiz?: TextHighlightQuiz;
  onComplete?: () => void;
  onSelectionComplete?: (start: number, end: number) => void;
}

interface CharacterRange {
  start: number;
  end: number;
}

type QuizState = "idle" | "incorrect" | "correct";
type SelectionState = "idle" | "incorrect" | "matched";

function getQuizQuestion(quiz: TextHighlightQuiz): string {
  return quiz.question ?? quiz.push_question ?? "Why is this selection suspicious?";
}

function getOptionKey(option: string): string {
  return option.trim().charAt(0).toUpperCase();
}

function calculateIoU(selection: CharacterRange, target: TextHighlightTrap): number {
  const intersectionStart = Math.max(selection.start, target.ground_truth_start);
  const intersectionEnd = Math.min(selection.end, target.ground_truth_end);
  const intersection = Math.max(0, intersectionEnd - intersectionStart);
  const unionStart = Math.min(selection.start, target.ground_truth_start);
  const unionEnd = Math.max(selection.end, target.ground_truth_end);
  const union = unionEnd - unionStart;

  return union === 0 ? 0 : intersection / union;
}

function getCharacterOffset(root: HTMLElement, node: Node, offset: number): number {
  const range = document.createRange();
  range.selectNodeContents(root);
  range.setEnd(node, offset);
  return range.toString().length;
}

function getSelectionRange(root: HTMLElement): CharacterRange | null {
  const selection = window.getSelection();

  if (
    !selection ||
    selection.isCollapsed ||
    !selection.anchorNode ||
    !selection.focusNode ||
    !root.contains(selection.anchorNode) ||
    !root.contains(selection.focusNode)
  ) {
    return null;
  }

  const anchorOffset = getCharacterOffset(
    root,
    selection.anchorNode,
    selection.anchorOffset,
  );
  const focusOffset = getCharacterOffset(
    root,
    selection.focusNode,
    selection.focusOffset,
  );
  const start = Math.min(anchorOffset, focusOffset);
  const end = Math.max(anchorOffset, focusOffset);

  return start === end ? null : { start, end };
}

export function TextHighlight({
  guide,
  postAuthor,
  postTime,
  content,
  traps = [],
  iouThreshold = 0.7,
  socraticQuiz,
  onComplete,
  onSelectionComplete,
}: TextHighlightProps) {
  const [activeTrapId, setActiveTrapId] = useState<string | null>(null);
  const [completedTrapIds, setCompletedTrapIds] = useState<string[]>([]);
  const [completedRanges, setCompletedRanges] = useState<CharacterRange[]>([]);
  const [selectedRange, setSelectedRange] = useState<CharacterRange | null>(null);
  const [pendingRange, setPendingRange] = useState<CharacterRange | null>(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [selectionFeedback, setSelectionFeedback] = useState("");
  const [selectionState, setSelectionState] = useState<SelectionState>("idle");
  const selectionTimerRef = useRef<number | null>(null);
  const textRootRef = useRef<HTMLDivElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const quizRef = useRef<HTMLDivElement>(null);

  const tokens = content.split(/(\s+)/);
  const tokensWithOffsets = tokens.map((token, index) => ({
    token,
    start: tokens
      .slice(0, index)
      .reduce((offset, currentToken) => offset + currentToken.length, 0),
  }));
  const activeTrap = traps.find((trap) => trap.trap_id === activeTrapId);
  const activeQuiz = activeTrap?.socratic_quiz ?? socraticQuiz;
  const allTrapsCompleted = traps.length > 0 && completedTrapIds.length === traps.length;
  const authorInitials = postAuthor
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
  const authorHandle = `@${postAuthor
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 28)}`;

  useEffect(() => {
    const target = pendingRange
      ? confirmationRef.current
      : activeTrapId
        ? quizRef.current
        : null;

    if (!target || window.matchMedia("(min-width: 640px)").matches) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeTrapId, pendingRange]);

  useEffect(() => {
    return () => {
      if (selectionTimerRef.current !== null) {
        window.clearTimeout(selectionTimerRef.current);
      }
    };
  }, []);

  const captureSelection = () => {
    if (!textRootRef.current) return;
    const range = getSelectionRange(textRootRef.current);

    if (range) {
      setPendingRange(range);
      setSelectedRange(null);
      setActiveTrapId(null);
      setQuizState("idle");
      setSelectionFeedback("");
      setSelectionState("idle");
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleConfirmHighlight = () => {
    if (!pendingRange) return;

    const candidate = traps
      .filter((trap) => !completedTrapIds.includes(trap.trap_id))
      .map((trap) => ({ trap, score: calculateIoU(pendingRange, trap) }))
      .sort((left, right) => right.score - left.score)[0];

    if (!candidate || candidate.score < iouThreshold) {
      setSelectedRange(pendingRange);
      setActiveTrapId(null);
      setSelectionFeedback(
        `Selection overlap is ${Math.round((candidate?.score ?? 0) * 100)}%. Select at least ${Math.round(iouThreshold * 100)}% of one manipulation.`,
      );
      setSelectionState("incorrect");
      setPendingRange(null);
      return;
    }

    setSelectedRange(pendingRange);
    setActiveTrapId(candidate.trap.trap_id);
    setSelectedOption("");
    setQuizState("idle");
    setSelectionFeedback(
      `Potential manipulation selected (${Math.round(candidate.score * 100)}% overlap).`,
    );
    setSelectionState("matched");
    onSelectionComplete?.(pendingRange.start, pendingRange.end);
    setPendingRange(null);
  };

  const handleCancelHighlight = () => {
    setPendingRange(null);
    setSelectionFeedback("");
    setSelectionState("idle");
  };

  const scheduleSelectionInspection = (delay = 0) => {
    if (selectionTimerRef.current !== null) {
      window.clearTimeout(selectionTimerRef.current);
    }

    selectionTimerRef.current = window.setTimeout(() => {
      selectionTimerRef.current = null;
      captureSelection();
    }, delay);
  };

  const handleQuizSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeTrap || !activeQuiz || !selectedOption) {
      return;
    }

    if (getOptionKey(selectedOption) === activeQuiz.correct_option) {
      setQuizState("correct");
      if (activeTrapId) {
        setCompletedTrapIds((prev) => [...prev, activeTrapId]);
      }
      setCompletedRanges((prev) => [
        ...prev,
        {
          start: activeTrap.ground_truth_start,
          end: activeTrap.ground_truth_end,
        },
      ]);

      setSelectedRange(null);
      return;
    }

    setQuizState("incorrect");
  };

  const handleQuizCancel = () => {
    setActiveTrapId(null);
    setSelectedOption("");
    setQuizState("idle");
  };

  const handleQuizContinue = () => {
    setActiveTrapId(null);
    setSelectedOption("");
    setQuizState("idle");
    if (traps.length > 0 && completedTrapIds.length >= traps.length) {
      onComplete?.();
    }
  };

  return (
    <RetroWindow title="Module 02 / Language Analysis">
      <ModuleGuide guide={guide} />
      <div className={gamePanel}>
        <div className="mb-4 flex items-center justify-between gap-3 border-b-2 border-ink pb-3">
          <span className={gameSectionBar}>Community wire</span>
          <span className="rounded-[4px] border-2 border-danger bg-background px-2 py-1 font-mono text-[10px] font-black uppercase text-danger">Unverified</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-ink bg-info text-xs font-black text-info-foreground shadow-[3px_3px_0_0_var(--color-ink)]">
            {authorInitials || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-black">{postAuthor}</div>
            <div className="truncate font-mono text-xs text-ink-soft">{authorHandle} / {postTime}</div>
          </div>
          <span className="font-mono text-lg font-black text-ink-soft" aria-label="Post options">...</span>
        </div>

        <div
          ref={textRootRef}
          onMouseUp={() => scheduleSelectionInspection()}
          onPointerUp={(event: PointerEvent<HTMLDivElement>) => {
            if (event.pointerType !== "mouse") {
              scheduleSelectionInspection(350);
            }
          }}
          aria-label="Social post content to analyze"
          className="mt-5 cursor-text touch-pan-y select-text whitespace-pre-wrap border-y-2 border-ink bg-background px-2 py-5 text-base leading-8 text-ink selection:bg-accent selection:text-ink sm:px-3"
        >
          {tokensWithOffsets.map(({ token, start }, index) => {
            const end = start + token.length;
            const isCompleted = completedRanges.some(
              (range) => start < range.end && end > range.start,
            );
            const isSelected =
              selectedRange !== null &&
              start < selectedRange.end &&
              end > selectedRange.start;
            const isPending =
              pendingRange !== null &&
              start < pendingRange.end &&
              end > pendingRange.start;

            return (
              <span
                key={index}
                data-index={start}
                className={`${isCompleted ? "bg-success/45" : ""} ${isSelected || isPending ? "bg-accent" : ""} hover:bg-accent/60`}
              >
                {token}
              </span>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[11px] font-bold uppercase text-ink-soft">
          <span className="rounded-[4px] border-2 border-ink bg-surface-2 px-2 py-1">Public post</span>
          <span className="rounded-[4px] border-2 border-ink bg-warn px-2 py-1 text-warn-foreground">Context pending</span>
          <span className="ml-auto">Evidence marks {completedTrapIds.length}/{traps.length}</span>
        </div>

        {pendingRange && (
          <div ref={confirmationRef} className="mt-4 scroll-mt-24 rounded-[6px] border-2 border-ink bg-warn p-3 text-warn-foreground">
            <p className="mb-3 text-sm font-black">
              Confirm this selection?
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={handleConfirmHighlight}
                className={`${gameButton} max-sm:flex-1`}
              >
                OK
              </button>
              <button
                type="button"
                onClick={handleCancelHighlight}
                className={`${gameButtonSecondary} max-sm:flex-1`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {selectionFeedback && (
          <p
            className={
              selectionState === "incorrect"
                ? `mt-3 ${gameFeedbackError}`
                : "mt-3 rounded-[6px] border-2 border-ink bg-info text-info-foreground p-3.5 font-mono text-base sm:text-lg font-black shadow-[3px_3px_0_0_var(--color-ink)]"
            }
            role={selectionState === "incorrect" ? "alert" : "status"}
            aria-live="polite"
          >
            {selectionFeedback}
          </p>
        )}
        {allTrapsCompleted && (
          <p className={`mt-3 ${gameFeedbackSuccess}`} role="status">
            All manipulation cues are documented.
          </p>
        )}
      </div>

      {activeQuiz && activeTrap && (
        <div ref={quizRef} className={`mt-5 scroll-mt-24 ${gamePanel}`}>
          <div className="mb-4 flex items-center justify-between gap-3 border-b-2 border-ink pb-3">
            <span className={gameSectionBar}>Critical thinking check</span>
            {quizState !== "correct" && (
              <button
                type="button"
                onClick={handleQuizCancel}
                aria-label="Close critical thinking question"
                className="grid h-8 w-8 place-items-center rounded-[5px] border-2 border-ink bg-surface text-base font-black text-ink shadow-[2px_2px_0_0_var(--color-ink)] transition-colors hover:bg-danger hover:text-danger-foreground"
              >
                X
              </button>
            )}
          </div>
          <span className={gameSectionBar}>Critical thinking check</span>
          
          <form onSubmit={handleQuizSubmit} className="flex flex-col gap-3">
            <div className="flex items-start gap-3 rounded-[6px] border-2 border-ink bg-surface-2 p-3 shadow-[2px_2px_0_0_var(--color-ink)]">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[5px] border-2 border-ink bg-accent text-lg font-black text-accent-foreground shadow-[2px_2px_0_0_var(--color-ink)]">
                ?
              </div>
              <p className="flex-1 pt-1 text-sm font-bold leading-relaxed text-ink sm:text-base">
                {getQuizQuestion(activeQuiz)}
              </p>
            </div>

              <div className="space-y-2">
                {activeQuiz.options.map((option) => (
                  <label
                    key={option}
                    className={gameOption}
                  >
                    <input
                      type="radio"
                      name={`socratic-${activeTrap.trap_id}`}
                      value={option}
                      checked={selectedOption === option}
                      onChange={(event) => {
                        setSelectedOption(event.target.value);
                        if (quizState === "incorrect") {
                          setQuizState("idle");
                        }
                      }}
                      className="mt-0.5"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {quizState === "incorrect" && (
                <p className={`mt-3 ${gameFeedbackError}`} role="alert">
                  That answer does not match the selected manipulation. Try again.
                </p>
              )}
              {quizState === "correct" && (
                <div className={`mt-3 ${gameFeedbackSuccess}`} role="status">
                  <p className="font-bold">Correct.</p>

                  <div className="rounded-[5px] border-2 border-ink bg-white p-2.5 text-xs text-black shadow-[2px_2px_0_0_var(--color-ink)]">
                    <span className="font-mono font-black uppercase text-emerald-800 block mb-1">
                      Correct answer:
                    </span>
                    <p className="font-medium italic text-black bg-emerald-50 p-2 rounded border border-ink">
                      "{activeTrap.matched_text || content.slice(activeTrap.ground_truth_start, activeTrap.ground_truth_end)}"
                    </p>
                  </div>
                  
                  {activeQuiz.explanation && <p>{activeQuiz.explanation}</p>}
                </div>
              )}
              <div className="static mt-4 flex flex-wrap justify-end gap-2 border-t-2 border-ink pt-3">
                {quizState === "correct" ? (
                  <button
                    type="button"
                    onClick={handleQuizContinue}
                    className={`${gameButton} w-full sm:w-auto`}
                  >
                    {allTrapsCompleted ? "Next" : "OK"}
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      disabled={!selectedOption}
                      className={`${gameButton} max-sm:flex-1`}
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={handleQuizCancel}
                      className={`${gameButtonSecondary} max-sm:flex-1`}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      )}
    </RetroWindow>
  );
}

export default TextHighlight;