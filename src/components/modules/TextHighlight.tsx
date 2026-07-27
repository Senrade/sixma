import {
  useRef,
  useState,
  type FormEvent,
  type PointerEvent,
} from "react";
import { RetroWindow } from "./RetroWindow";

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
    <RetroWindow title="AnonForum.exe  |  thread://viewer" onClose={onBack}>
      <div className="bg-white p-3 shadow-[inset_2px_2px_0_#808080,inset_-1px_-1px_0_#fff]">
        <div className="mb-2 flex items-center gap-2 border-b border-dashed border-[#808080] pb-1">
          <div className="h-8 w-8 bg-[#000080] text-center text-[10px] leading-8 text-white shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#fff]">
            ??
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold">{postAuthor}</div>
            <div className="text-[10px] text-[#606060]">{postTime}</div>
          </div>
          <div className="text-[10px] text-[#606060]">#anonymous</div>
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
          className="select-text whitespace-pre-wrap text-sm leading-relaxed text-black"
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
                className={`${isCompleted ? "bg-[#d7ffd7]" : ""} ${isSelected || isPending ? "bg-[#fff2a8]" : ""} hover:bg-[#fff2a8]`}
              >
                {token}
              </span>
            );
          })}
        </div>

        {pendingRange && (
          <div className="mt-3 bg-[#c0c0c0] p-3 shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#dfdfdf,inset_-2px_-2px_0_#808080,inset_2px_2px_0_#fff]">
            <p className="mb-2 text-xs font-bold text-black">
              Confirm this selection?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleConfirmHighlight}
                className="min-w-[70px] bg-[#c0c0c0] px-3 py-1 text-xs text-black shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#fff,inset_-2px_-2px_0_#808080,inset_2px_2px_0_#dfdfdf] active:shadow-[inset_1px_1px_0_#000,inset_-1px_-1px_0_#fff]"
              >
                OK
              </button>
              <button
                type="button"
                onClick={handleCancelHighlight}
                className="min-w-[70px] bg-[#c0c0c0] px-3 py-1 text-xs text-black shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#fff,inset_-2px_-2px_0_#808080,inset_2px_2px_0_#dfdfdf] active:shadow-[inset_1px_1px_0_#000,inset_-1px_-1px_0_#fff]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {selectionFeedback && (
          <p className="mt-2 border-t border-dashed border-[#808080] pt-2 text-[10px] text-[#404040]" role="status" aria-live="polite">
            {selectionFeedback}
          </p>
        )}
        {traps.length > 0 && (
          <p className="mt-1 text-[10px] text-[#606060]">
            Highlights found: {completedTrapIds.length} / {traps.length}
          </p>
        )}
        {allTrapsCompleted && (
          <p className="mt-1 text-[10px] font-bold text-green-700" role="status">
            All manipulation cues are documented.
          </p>
        )}
      </div>

      {activeQuiz && activeTrap && (
        <div className="mt-3 bg-[#c0c0c0] shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#dfdfdf,inset_-2px_-2px_0_#808080,inset_2px_2px_0_#fff]">
          <div className="flex items-center justify-between bg-[#000080] px-1 py-0.5 text-white">
            <span className="text-xs font-bold">System Critical Thinking</span>
            <button
              type="button"
              onClick={handleQuizCancel}
              aria-label="Close critical thinking question"
              className="h-4 w-5 bg-[#c0c0c0] text-[10px] leading-none text-black shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#fff]"
            >
              
            </button>
          </div>
          <form onSubmit={handleQuizSubmit} className="flex gap-3 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-yellow-300 text-lg font-bold shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#fff]">
              ?
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold">{getQuizQuestion(activeQuiz)}</p>
              <div className="mt-2 space-y-1">
                {activeQuiz.options.map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-start gap-2 bg-white px-2 py-1 text-xs shadow-[inset_1px_1px_0_#808080,inset_-1px_-1px_0_#fff]"
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
                <p className="mt-2 bg-[#ffd7d7] p-2 text-xs" role="alert">
                  That answer does not match the selected manipulation. Try again.
                </p>
              )}
              {quizState === "correct" && (
                <div className="mt-2 bg-[#d7ffd7] p-3 text-xs rounded-[5px] border-2 border-ink" role="status">
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
              <div className="mt-3 flex justify-end gap-2">
                {quizState === "correct" && (finalTrapSelected || allTrapsCompleted) ? (
                  <button
                    type="button"
                    onClick={handleQuizContinue}
                    className="min-w-[70px] bg-[#c0c0c0] px-4 py-1 text-xs font-bold text-black shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#fff,inset_-2px_-2px_0_#808080,inset_2px_2px_0_#dfdfdf] active:shadow-[inset_1px_1px_0_#000,inset_-1px_-1px_0_#fff]"
                  >
                    Next
                  </button>
                ) : (
                  <>
                    {quizState === "correct" ? (
                      <button
                        type = "button"
                        onClick={handleQuizContinue}
                        className="min-w-[70px] bg-[#c0c0c0] px-3 py-1 text-xs shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#fff,inset_-2px_-2px_0_#808080,inset_2px_2px_0_#dfdfdf] active:shadow-[inset_1px_1px_0_#000,inset_-1px_-1px_0_#fff]"
                      >
                        OK
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!selectedOption}
                        className="min-w-[70px] bg-[#c0c0c0] px-3 py-1 text-xs shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#fff,inset_-2px_-2px_0_#808080,inset_2px_2px_0_#dfdfdf] enabled:active:shadow-[inset_1px_1px_0_#000,inset_-1px_-1px_0_#fff] disabled:cursor-not-allowed disabled:text-[#808080]"
                      >
                        OK
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleQuizCancel}
                      className="min-w-[70px] bg-[#c0c0c0] px-3 py-1 text-xs shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#fff,inset_-2px_-2px_0_#808080,inset_2px_2px_0_#dfdfdf] active:shadow-[inset_1px_1px_0_#000,inset_-1px_-1px_0_#fff]"
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
