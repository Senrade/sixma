import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent,
} from "react";
import type { ModuleGuideDefinition } from "@/lib/module-guides";
import { useI18n } from "@/i18n/I18nProvider";
import { ModuleGuide } from "./ModuleGuide";
import { ProgressiveHint } from "./ProgressiveHint";
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
  guideDefaultExpanded?: boolean;
  onComplete?: () => void;
  onSelectionComplete?: (start: number, end: number) => void;
}

interface CharacterRange {
  start: number;
  end: number;
}

type QuizState = "idle" | "incorrect" | "correct";
type SelectionState = "idle" | "incorrect" | "matched";
const HINT_ATTEMPT_THRESHOLD = 2;

function getQuizQuestion(quiz: TextHighlightQuiz, fallback: string): string {
  return quiz.question ?? quiz.push_question ?? fallback;
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

function getTextRegion(
  trap: TextHighlightTrap | undefined,
  contentLength: number,
): "start" | "middle" | "end" {
  if (!trap || contentLength === 0) return "middle";

  const midpoint = (trap.ground_truth_start + trap.ground_truth_end) / 2;
  const ratio = midpoint / contentLength;
  if (ratio < 1 / 3) return "start";
  if (ratio > 2 / 3) return "end";
  return "middle";
}

export function TextHighlight({
  guide,
  postAuthor,
  postTime,
  content,
  traps = [],
  iouThreshold = 0.7,
  socraticQuiz,
  guideDefaultExpanded = true,
  onComplete,
  onSelectionComplete,
}: TextHighlightProps) {
  const { t } = useI18n();
  const [activeTrapId, setActiveTrapId] = useState<string | null>(null);
  const [completedTrapIds, setCompletedTrapIds] = useState<string[]>([]);
  const [completedRanges, setCompletedRanges] = useState<CharacterRange[]>([]);
  const [selectedRange, setSelectedRange] = useState<CharacterRange | null>(null);
  const [pendingRange, setPendingRange] = useState<CharacterRange | null>(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [selectionFeedback, setSelectionFeedback] = useState("");
  const [selectionState, setSelectionState] = useState<SelectionState>("idle");
  const [selectionMisses, setSelectionMisses] = useState(0);
  const [quizMisses, setQuizMisses] = useState(0);
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
  const unresolvedTrap = traps.find(
    (trap) => !completedTrapIds.includes(trap.trap_id),
  );
  const textRegion = t(`module.hint.text.region.${getTextRegion(unresolvedTrap, content.length)}`);
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
      setSelectionFeedback(t("module.text.overlapError", {
        overlap: Math.round((candidate?.score ?? 0) * 100),
        required: Math.round(iouThreshold * 100),
      }));
      setSelectionState("incorrect");
      setSelectionMisses((count) => count + 1);
      setPendingRange(null);
      return;
    }

    setSelectedRange(pendingRange);
    setActiveTrapId(candidate.trap.trap_id);
    setSelectedOption("");
    setQuizState("idle");
    setQuizMisses(0);
    setSelectionFeedback(t("module.text.overlapSuccess", {
      overlap: Math.round(candidate.score * 100),
    }));
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
    setQuizMisses((count) => count + 1);
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
    <RetroWindow title={t("module.text.windowTitle")}>
      <ModuleGuide guide={guide} defaultExpanded={guideDefaultExpanded} />
      <div className={gamePanel}>
        <div className="mb-4 flex items-center justify-between gap-3 border-b-2 border-ink pb-3">
          <span className={gameSectionBar}>{t("module.text.communityWire")}</span>
          <span className="rounded-[4px] border-2 border-danger bg-background px-2 py-1 font-mono text-[10px] font-black uppercase text-danger">{t("module.text.unverified")}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-ink bg-info text-xs font-black text-info-foreground shadow-[3px_3px_0_0_var(--color-ink)]">
            {authorInitials || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-black">{postAuthor}</div>
            <div className="truncate font-mono text-xs text-ink-soft">{authorHandle} / {postTime}</div>
          </div>
          <span className="font-mono text-lg font-black text-ink-soft" aria-label={t("module.text.postOptionsAria")}>...</span>
        </div>

        <div
          ref={textRootRef}
          onMouseUp={() => scheduleSelectionInspection()}
          onPointerUp={(event: PointerEvent<HTMLDivElement>) => {
            if (event.pointerType !== "mouse") {
              scheduleSelectionInspection(350);
            }
          }}
          aria-label={t("module.text.contentAria")}
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
          <span className="rounded-[4px] border-2 border-ink bg-surface-2 px-2 py-1">{t("module.text.publicPost")}</span>
          <span className="rounded-[4px] border-2 border-ink bg-warn px-2 py-1 text-warn-foreground">{t("module.text.contextPending")}</span>
          <span className="ml-auto">{t("module.text.evidenceMarks", { completed: completedTrapIds.length, total: traps.length })}</span>
        </div>

        {pendingRange && (
          <div ref={confirmationRef} className="mt-4 scroll-mt-24 rounded-[6px] border-2 border-ink bg-warn p-3 text-warn-foreground">
            <p className="mb-3 text-sm font-black">
              {t("module.text.confirmSelection")}
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={handleConfirmHighlight}
                className={`${gameButton} max-sm:flex-1`}
              >
                {t("module.common.ok")}
              </button>
              <button
                type="button"
                onClick={handleCancelHighlight}
                className={`${gameButtonSecondary} max-sm:flex-1`}
              >
                {t("module.common.cancel")}
              </button>
            </div>
          </div>
        )}

        {selectionFeedback && (
          <p
            className={
              selectionState === "incorrect"
                ? `mt-3 ${gameFeedbackError}`
                : "mt-3 rounded-[6px] border-2 border-ink bg-info/15 p-3 font-mono text-sm font-bold text-ink"
            }
            role={selectionState === "incorrect" ? "alert" : "status"}
            aria-live="polite"
          >
            {selectionFeedback}
          </p>
        )}
        <ProgressiveHint
          available={selectionMisses >= HINT_ATTEMPT_THRESHOLD && !activeTrap}
          hints={[
            t("module.hint.text.inspect"),
            t("module.hint.text.focus", { region: textRegion }),
          ]}
        />
        {allTrapsCompleted && (
          <p className={`mt-3 ${gameFeedbackSuccess}`} role="status">
            {t("module.text.allFound")}
          </p>
        )}
      </div>

      {activeQuiz && activeTrap && (
        <div ref={quizRef} className={`mt-5 scroll-mt-24 ${gamePanel}`}>
          <span className={gameSectionBar}>{t("module.common.criticalThinking")}</span>
          <form onSubmit={handleQuizSubmit} className="flex flex-col gap-4 sm:flex-row">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[5px] border-2 border-ink bg-accent text-xl font-black text-accent-foreground shadow-[3px_3px_0_0_var(--color-ink)]">
              ?
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-6">{getQuizQuestion(activeQuiz, t("module.text.defaultQuestion"))}</p>
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
                  {t("module.text.quizError")}
                </p>
              )}
              <ProgressiveHint
                available={quizMisses >= 1}
                hints={[
                  t("module.hint.quiz.identifyEffect"),
                  t("module.hint.quiz.rejectAssumption"),
                ]}
              />
              {quizState === "correct" && (
                <div className={`mt-3 ${gameFeedbackSuccess}`} role="status">
                  <p className="font-bold">{t("module.common.correct")}</p>

                  <div className="rounded-[5px] border-2 border-ink bg-white p-2.5 text-xs text-black shadow-[2px_2px_0_0_var(--color-ink)]">
                    <span className="font-mono font-black uppercase text-emerald-800 block mb-1">
                      {t("module.text.correctAnswer")}
                    </span>
                    <p className="font-medium italic text-black bg-emerald-50 p-2 rounded border border-ink">
                      &quot;{activeTrap.matched_text || content.slice(activeTrap.ground_truth_start, activeTrap.ground_truth_end)}&quot;
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
                    {allTrapsCompleted ? t("module.common.next") : t("module.common.ok")}
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      disabled={!selectedOption}
                      className={`${gameButton} max-sm:flex-1`}
                    >
                      {t("module.common.ok")}
                    </button>
                    <button
                      type="button"
                      onClick={handleQuizCancel}
                      className={`${gameButtonSecondary} max-sm:flex-1`}
                    >
                      {t("module.common.cancel")}
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
