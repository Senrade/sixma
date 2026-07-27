import {
  useRef,
  useState,
  type FormEvent,
  type PointerEvent,
} from "react";
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
  postAuthor: string;
  postTime: string;
  content: string;
  traps?: TextHighlightTrap[];
  iouThreshold?: number;
  socraticQuiz?: TextHighlightQuiz;
  onComplete?: () => void;
  onBack?: () => void;
  onSelectionComplete?: (start: number, end: number) => void;
}

interface CharacterRange {
  start: number;
  end: number;
}

type QuizState = "idle" | "incorrect" | "correct";

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
  postAuthor,
  postTime,
  content,
  traps = [],
  iouThreshold = 0.7,
  socraticQuiz,
  onComplete,
  onBack,
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
  const selectionTimerRef = useRef<number | null>(null);
  const textRootRef = useRef<HTMLDivElement>(null);

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
  const finalTrapSelected =
    activeTrap !== undefined &&
    traps.length > 0 &&
    completedTrapIds.length === traps.length - 1;

  const captureSelection = () => {
    if (!textRootRef.current) return;
    const range = getSelectionRange(textRootRef.current);

    if (range) {
      setPendingRange(range);
      setSelectedRange(null);
      setActiveTrapId(null);
      setQuizState("idle");
      setSelectionFeedback("");
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
    onSelectionComplete?.(pendingRange.start, pendingRange.end);
    setPendingRange(null);
  };

  const handleCancelHighlight = () => {
    setPendingRange(null);
  };

  const scheduleSelectionInspection = () => {
    if (selectionTimerRef.current !== null) {
      window.clearTimeout(selectionTimerRef.current);
    }

    selectionTimerRef.current = window.setTimeout(() => {
      selectionTimerRef.current = null;
      captureSelection();
    }, 0);
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
      if (selectedRange) {
        setCompletedRanges((prev) => [...prev, selectedRange]);
      }
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
    <RetroWindow title="Module 02 / Language Analysis" onClose={onBack}>
      <div className={gamePanel}>
        <div className="mb-4 flex items-center gap-3 border-b-2 border-ink pb-3">
          <div className="grid h-10 w-10 place-items-center rounded-[5px] border-2 border-ink bg-info text-xs font-black text-info-foreground">
            ??
          </div>
          <div className="flex-1">
            <div className="text-sm font-black">{postAuthor}</div>
            <div className="font-mono text-xs text-ink-soft">{postTime}</div>
          </div>
          <div className="hidden font-mono text-xs text-ink-soft sm:block">#anonymous</div>
        </div>

        <div
          ref={textRootRef}
          onMouseUp={scheduleSelectionInspection}
          onPointerUp={(event: PointerEvent<HTMLDivElement>) => {
            if (event.pointerType !== "mouse") {
              scheduleSelectionInspection();
            }
          }}
          onTouchEnd={scheduleSelectionInspection}
          className="select-text whitespace-pre-wrap text-base leading-8 text-ink"
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

        {pendingRange && (
          <div className="mt-4 rounded-[6px] border-2 border-ink bg-warn p-3 text-warn-foreground">
            <p className="mb-3 text-sm font-black">
              Confirm this selection?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleConfirmHighlight}
                className={gameButton}
              >
                OK
              </button>
              <button
                type="button"
                onClick={handleCancelHighlight}
                className={gameButtonSecondary}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {selectionFeedback && (
          <p className="mt-3 border-t-2 border-ink pt-3 font-mono text-xs text-ink-soft" role="status" aria-live="polite">
            {selectionFeedback}
          </p>
        )}
        {traps.length > 0 && (
          <p className="mt-2 font-mono text-xs text-ink-soft">
            Highlights found: {completedTrapIds.length} / {traps.length}
          </p>
        )}
        {allTrapsCompleted && (
          <p className="mt-2 text-sm font-black text-success" role="status">
            All manipulation cues are documented.
          </p>
        )}
      </div>

      {activeQuiz && activeTrap && (
        <div className={`mt-5 ${gamePanel}`}>
          <div className="flex items-start justify-between gap-3">
            <span className={gameSectionBar}>Critical thinking check</span>
            <button
              type="button"
              onClick={handleQuizCancel}
              aria-label="Close critical thinking question"
              className="grid h-8 w-8 place-items-center rounded-[5px] border-2 border-ink bg-surface text-lg font-black text-ink hover:bg-danger hover:text-danger-foreground"
            >
              &times;
            </button>
          </div>
          <form onSubmit={handleQuizSubmit} className="flex flex-col gap-4 sm:flex-row">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[5px] border-2 border-ink bg-accent text-xl font-black text-accent-foreground shadow-[3px_3px_0_0_var(--color-ink)]">
              ?
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold">{getQuizQuestion(activeQuiz)}</p>
              <div className="mt-2 space-y-1">
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
                  {activeQuiz.explanation && <p>{activeQuiz.explanation}</p>}
                </div>
              )}
              <div className="mt-3 flex justify-end gap-2">
                {quizState === "correct" ? (
                  <button
                    type="button"
                    onClick={handleQuizContinue}
                    className={gameButton}
                  >
                    {finalTrapSelected || allTrapsCompleted ? "Next" : "OK"}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!selectedOption}
                    className={gameButton}
                  >
                    OK
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleQuizCancel}
                  className={gameButtonSecondary}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </RetroWindow>
  );
}

export default TextHighlight;
