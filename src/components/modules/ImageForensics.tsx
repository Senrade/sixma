import {
  useRef,
  useState,
  useEffect,
  type CSSProperties,
  type PointerEvent,
} from "react";
import Image from "next/image";
import { useI18n } from "@/i18n/I18nProvider";
import type { ModuleGuideDefinition } from "@/lib/module-guides";
import { ModuleGuide } from "./ModuleGuide";
import { ProgressiveHint } from "./ProgressiveHint";
import { RetroWindow } from "./RetroWindow";
import {
  gameButton,
  gameFeedbackError,
  gameFeedbackSuccess,
  gameOption,
  gamePanel,
  gameSectionBar,
} from "./moduleStyles";

export interface ImageForensicsQuiz {
  question: string;
  options: string[];
  correct_option?: string;
  explanation?: string;
}

export interface ImageForensicsAnomaly {
  anomaly_id: string;
  name: string;
  x_pct: number;
  y_pct: number;
  radius_pct: number;
  description: string;
  socratic_quiz?: ImageForensicsQuiz;
}

export interface ImageForensicsProps {
  guide: ModuleGuideDefinition;
  imageUrl: string;
  contextText: string;
  targetAnomalies: ImageForensicsAnomaly[];
  socraticQuiz?: ImageForensicsQuiz;
  imageWidth?: number;
  imageHeight?: number;
  guideDefaultExpanded?: boolean;
  onComplete?: () => void;
}

type QuizState = "idle" | "incorrect" | "correct";

interface DrawnCircle {
  x_pct: number;
  y_pct: number;
  radius_pct: number;
  result: "pending" | "incorrect" | "correct";
}

interface ConfirmedCircle extends DrawnCircle {
  anomalyId: string;
}

interface CircleInPixels {
  x: number;
  y: number;
  radius: number;
}

const MIN_DRAWN_RADIUS_PCT = 3;
const DEFAULT_CLICK_RADIUS_PCT = 8;
const CLICK_DRAG_THRESHOLD_PCT = 1;
const MIN_SMALLER_CIRCLE_OVERLAP = 0.3;
const TARGET_CENTER_TOLERANCE = 1.15;
const MAX_RADIUS_RATIO = 2.5;
const REQUIRED_EVIDENCE_COUNT = 2;
const HINT_ATTEMPT_THRESHOLD = 2;

function getOptionKey(option: string): string {
  return option.trim().charAt(0).toUpperCase();
}

function getCircleIntersectionArea(
  first: CircleInPixels,
  second: CircleInPixels,
): number {
  const distance = Math.hypot(first.x - second.x, first.y - second.y);
  const firstRadius = first.radius;
  const secondRadius = second.radius;

  if (distance >= firstRadius + secondRadius) {
    return 0;
  }

  if (distance <= Math.abs(firstRadius - secondRadius)) {
    return Math.PI * Math.min(firstRadius, secondRadius) ** 2;
  }

  const firstAngle = Math.acos(
    (distance ** 2 + firstRadius ** 2 - secondRadius ** 2) /
      (2 * distance * firstRadius),
  );
  const secondAngle = Math.acos(
    (distance ** 2 + secondRadius ** 2 - firstRadius ** 2) /
      (2 * distance * secondRadius),
  );
  const overlapTriangleArea = 0.5 * Math.sqrt(
    (-distance + firstRadius + secondRadius) *
      (distance + firstRadius - secondRadius) *
      (distance - firstRadius + secondRadius) *
      (distance + firstRadius + secondRadius),
  );

  return (
    firstRadius ** 2 * firstAngle +
    secondRadius ** 2 * secondAngle -
    overlapTriangleArea
  );
}

function toPixelCircle(
  circle: Pick<DrawnCircle, "x_pct" | "y_pct" | "radius_pct">,
  width: number,
  height: number,
): CircleInPixels {
  return {
    x: (circle.x_pct / 100) * width,
    y: (circle.y_pct / 100) * height,
    radius: (circle.radius_pct / 100) * width,
  };
}

// Giữ nguyên 100% công thức hình tròn ban đầu
function getCircleFromDrag(
  start: { x_pct: number; y_pct: number },
  end: { x_pct: number; y_pct: number },
  imageBounds: DOMRect,
): DrawnCircle {
  const horizontalDistance = end.x_pct - start.x_pct;
  const verticalDistanceAsWidthPct =
    (end.y_pct - start.y_pct) * (imageBounds.height / imageBounds.width);

  return {
    x_pct: (start.x_pct + end.x_pct) / 2,
    y_pct: (start.y_pct + end.y_pct) / 2,
    radius_pct: Math.max(
      Math.hypot(horizontalDistance, verticalDistanceAsWidthPct) / 2,
      MIN_DRAWN_RADIUS_PCT,
    ),
    result: "pending",
  };
}

export function ImageForensics({
  guide,
  imageUrl,
  contextText,
  targetAnomalies,
  socraticQuiz,
  imageWidth = 16,
  imageHeight = 9,
  guideDefaultExpanded = true,
  onComplete,
}: ImageForensicsProps) {
  const { t } = useI18n();
  const [foundAnomalyIds, setFoundAnomalyIds] = useState<string[]>([]);
  const [activeAnomalyId, setActiveAnomalyId] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [clickMessage, setClickMessage] = useState("");
  const [drawnCircle, setDrawnCircle] = useState<DrawnCircle | null>(null);
  const [confirmedCircles, setConfirmedCircles] = useState<ConfirmedCircle[]>([]);
  const [isReviewingEvidence, setIsReviewingEvidence] = useState(false);
  const [evidenceMisses, setEvidenceMisses] = useState(0);
  const [quizMisses, setQuizMisses] = useState(0);

  // Trạng thái kích hoạt chế độ khoanh tròn
  const [isDrawingActive, setIsDrawingActive] = useState(false);

  const drawStartRef = useRef<{ x_pct: number; y_pct: number } | null>(null);
  const tapStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Click ra ngoài hình ảnh để hủy chế độ khoanh tròn nếu lỡ bật
  useEffect(() => {
    const handlePointerDownOutside = (event: globalThis.PointerEvent) => {
      if (
        imageContainerRef.current &&
        !imageContainerRef.current.contains(event.target as Node)
      ) {
        setIsDrawingActive(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDownOutside);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDownOutside);
    };
  }, []);

  const activeAnomaly = targetAnomalies.find(
    (anomaly) => anomaly.anomaly_id === activeAnomalyId,
  );
  const activeQuiz = activeAnomaly?.socratic_quiz ?? socraticQuiz;
  const requiredEvidenceCount = Math.min(
    REQUIRED_EVIDENCE_COUNT,
    targetAnomalies.length,
  );
  const hasRequiredEvidence =
    requiredEvidenceCount > 0 &&
    foundAnomalyIds.length >= requiredEvidenceCount;
  const imageStyle = {
    aspectRatio: `${imageWidth} / ${imageHeight}`,
  } satisfies CSSProperties;
  const unresolvedAnomaly = targetAnomalies.find(
    (anomaly) => !foundAnomalyIds.includes(anomaly.anomaly_id),
  );
  const horizontalArea = (unresolvedAnomaly?.x_pct ?? 50) < 34
    ? t("module.hint.area.left")
    : (unresolvedAnomaly?.x_pct ?? 50) > 66
      ? t("module.hint.area.right")
      : t("module.hint.area.center");
  const verticalArea = (unresolvedAnomaly?.y_pct ?? 50) < 34
    ? t("module.hint.area.top")
    : (unresolvedAnomaly?.y_pct ?? 50) > 66
      ? t("module.hint.area.bottom")
      : t("module.hint.area.middle");

  const getImagePoint = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x_pct: Math.min(
        100,
        Math.max(0, ((event.clientX - rect.left) / rect.width) * 100),
      ),
      y_pct: Math.min(
        100,
        Math.max(0, ((event.clientY - rect.top) / rect.height) * 100),
      ),
    };
  };

  const evaluateDrawnCircle = (
    circle: DrawnCircle,
    imageBounds: DOMRect,
  ) => {
    const drawnCircleInPixels = toPixelCircle(
      circle,
      imageBounds.width,
      imageBounds.height,
    );
    const selectedAnomaly = targetAnomalies
      .filter((anomaly) => !foundAnomalyIds.includes(anomaly.anomaly_id))
      .map((anomaly) => {
        const anomalyCircleInPixels = toPixelCircle(
          anomaly,
          imageBounds.width,
          imageBounds.height,
        );
        const overlapArea =
          getCircleIntersectionArea(
            drawnCircleInPixels,
            anomalyCircleInPixels,
          );
        const smallerCircleArea = Math.PI * Math.min(
          drawnCircleInPixels.radius,
          anomalyCircleInPixels.radius,
        ) ** 2;
        const smallerCircleOverlap = overlapArea / smallerCircleArea;
        const centerDistance = Math.hypot(
          drawnCircleInPixels.x - anomalyCircleInPixels.x,
          drawnCircleInPixels.y - anomalyCircleInPixels.y,
        );
        const radiusRatio =
          drawnCircleInPixels.radius / anomalyCircleInPixels.radius;
        const pointsAtTarget =
          centerDistance <=
          anomalyCircleInPixels.radius * TARGET_CENTER_TOLERANCE;
        const enclosesTargetCenter =
          centerDistance <= drawnCircleInPixels.radius;

        return {
          anomaly,
          centerDistance,
          enclosesTargetCenter,
          radiusRatio,
          pointsAtTarget,
          smallerCircleOverlap,
        };
      })
      .filter(
        ({
          enclosesTargetCenter,
          pointsAtTarget,
          radiusRatio,
          smallerCircleOverlap,
        }) =>
          radiusRatio <= MAX_RADIUS_RATIO &&
          smallerCircleOverlap >= MIN_SMALLER_CIRCLE_OVERLAP &&
          (pointsAtTarget || enclosesTargetCenter),
      )
      .sort(
        (first, second) => first.centerDistance - second.centerDistance,
      )[0]?.anomaly;

    if (!selectedAnomaly) {
      setEvidenceMisses((count) => count + 1);
      setDrawnCircle({ ...circle, result: "incorrect" });
      setClickMessage(t("module.image.drawError"));
      return;
    }

    setDrawnCircle({ ...circle, result: "correct" });
    setClickMessage("");
    setActiveAnomalyId(selectedAnomaly.anomaly_id);
    setSelectedOption("");
    setQuizState("idle");
    setQuizMisses(0);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (activeAnomalyId || isReviewingEvidence) {
      return;
    }

    // Nếu chưa ở chế độ khoanh tròn: Ghi lại vị trí nhấn để nhận diện hành vi Chạm (Tap)
    if (!isDrawingActive) {
      tapStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        time: Date.now(),
      };
      return;
    }

    // Khi ĐÃ ở chế độ khoanh tròn: Tiến hành chuẩn bị vẽ
    if (event.pointerType === "touch" && event.cancelable) {
      event.preventDefault();
    }

    const point = getImagePoint(event);
    drawStartRef.current = point;
    setClickMessage("");
    setDrawnCircle({ ...point, radius_pct: 0, result: "pending" });

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Fallback
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDrawingActive || !drawStartRef.current || activeAnomalyId || isReviewingEvidence) {
      return;
    }

    if (event.pointerType === "touch" && event.cancelable) {
      event.preventDefault();
    }

    const point = getImagePoint(event);
    setDrawnCircle(
      getCircleFromDrag(
        drawStartRef.current,
        point,
        event.currentTarget.getBoundingClientRect(),
      ),
    );
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (activeAnomalyId || isReviewingEvidence) {
      return;
    }

    // TRƯỜNG HỢP 1: Chưa bật chế độ khoanh tròn -> Kiểm tra nếu là hành vi Chạm (Tap)
    if (!isDrawingActive) {
      if (tapStartRef.current) {
        const dx = Math.abs(event.clientX - tapStartRef.current.x);
        const dy = Math.abs(event.clientY - tapStartRef.current.y);
        const dt = Date.now() - tapStartRef.current.time;

        // Nếu di chuyển nhỏ hơn 10px và thời gian ngắn -> Đây là Chạm (Tap) 1 lần vào ảnh
        if (dx < 10 && dy < 10 && dt < 500) {
          setIsDrawingActive(true); // KÍCH HOẠT VIỀN VÀNG & CHẾ ĐỘ KHOANH TRÒN
        }
        tapStartRef.current = null;
      }
      return;
    }

    // TRƯỜNG HỢP 2: Đã bật chế độ khoanh tròn -> Thực hiện vẽ & TỰ ĐỘNG TẮT sau khi thả tay
    if (drawStartRef.current) {
      const point = getImagePoint(event);
      const imageBounds = event.currentTarget.getBoundingClientRect();
      const distance = Math.hypot(
        point.x_pct - drawStartRef.current.x_pct,
        (point.y_pct - drawStartRef.current.y_pct) *
          (imageBounds.height / imageBounds.width),
      );
      const circle =
        distance < CLICK_DRAG_THRESHOLD_PCT
          ? {
              ...drawStartRef.current,
              radius_pct: DEFAULT_CLICK_RADIUS_PCT,
              result: "pending" as const,
            }
          : getCircleFromDrag(drawStartRef.current, point, imageBounds);

      drawStartRef.current = null;
      evaluateDrawnCircle(circle, imageBounds);

      // TỰ ĐỘNG TẮT CHẾ ĐỘ KHOANH TRÒN VÀ VIỀN VÀNG SAU KHI THẢ TAY
      setIsDrawingActive(false);

      try {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      } catch {
        // Ignore
      }
    }
  };

  const handlePointerCancel = () => {
    drawStartRef.current = null;
    tapStartRef.current = null;
    setDrawnCircle(null);
  };

  const handleQuizSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeAnomaly || !activeQuiz || !selectedOption) {
      return;
    }

    if (getOptionKey(selectedOption) === activeQuiz.correct_option) {
      setFoundAnomalyIds((currentIds) =>
        currentIds.includes(activeAnomaly.anomaly_id)
          ? currentIds
          : [...currentIds, activeAnomaly.anomaly_id],
      );
      if (drawnCircle) {
        setConfirmedCircles((currentCircles) =>
          currentCircles.some(
            (circle) => circle.anomalyId === activeAnomaly.anomaly_id,
          )
            ? currentCircles
            : [
                ...currentCircles,
                {
                  ...drawnCircle,
                  anomalyId: activeAnomaly.anomaly_id,
                  result: "correct",
                },
              ],
        );
      }
      setQuizState("correct");
      return;
    }

    setQuizState("incorrect");
    setQuizMisses((count) => count + 1);
  };

  const handleContinue = () => {
    if (!activeAnomaly || quizState !== "correct") {
      return;
    }

    setActiveAnomalyId(null);
    setSelectedOption("");
    setQuizState("idle");
    setDrawnCircle(null);

    if (hasRequiredEvidence) {
      setIsReviewingEvidence(true);
    }
  };

  return (
    <RetroWindow title={t("module.image.windowTitle")}>
      <ModuleGuide
        guide={guide}
        defaultExpanded={guideDefaultExpanded}
      />

      <div className="rounded-[6px] border-2 border-ink bg-surface shadow-[5px_5px_0_0_var(--color-ink)] md:border-0 md:bg-transparent md:shadow-none">
        <div className="grid min-h-0 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(260px,380px)]">
          {/* === PHẦN 1: HÌNH ẢNH === */}
          <div className="flex min-h-0 flex-col items-center justify-center overflow-hidden p-2 md:p-0">
            <div
              ref={imageContainerRef}
              aria-label={t("module.image.canvasAria")}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              style={{
                ...imageStyle,
                // Khi bật khoanh tròn: touchAction là "none" để khóa cuộn. Khi chưa bật: "pan-y" để cuộn thoải mái.
                touchAction: isDrawingActive ? "none" : "pan-y",
                WebkitTouchCallout: "none",
                WebkitUserSelect: "none",
                userSelect: "none",
              }}
              className={`relative w-full max-w-full overflow-hidden rounded-[4px] bg-black select-none transition-all duration-200 md:rounded-[6px] ${
                isDrawingActive
                  ? "border-8 border-amber-400 ring-8 ring-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.6)] cursor-crosshair"
                  : "border-4 border-ink shadow-[5px_5px_0_0_var(--color-ink)] cursor-pointer"
              } ${
                activeAnomaly
                  ? "max-h-[43dvh] md:max-h-[calc(100dvh-60px)]"
                  : "max-h-[calc(100dvh-60px)]"
              }`}
            >
              {/* Giữ nguyên độ sắc nét tối đa của ảnh AI gốc */}
              <Image
                src={imageUrl}
                alt={t("module.image.evidenceAlt")}
                fill
                unoptimized
                draggable={false}
                sizes="(min-width: 768px) calc(100vw - 380px), 100vw"
                className="pointer-events-none block h-full w-full object-contain select-none"
              />

              {/* OVERLAY HÌNH TRÒN */}
              <div className="pointer-events-none absolute inset-0 select-none">
                <svg
                  className="h-full w-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {confirmedCircles.map((circle, idx) => (
                    <ellipse
                      key={circle.anomalyId || idx}
                      cx={circle.x_pct}
                      cy={circle.y_pct}
                      rx={circle.radius_pct}
                      ry={circle.radius_pct * (imageWidth / imageHeight)}
                      className="fill-accent/20 stroke-accent stroke-[1.5] [stroke-dasharray:4_2]"
                    />
                  ))}

                  {isReviewingEvidence &&
                    targetAnomalies.map((anomaly) => (
                      <ellipse
                        key={anomaly.anomaly_id}
                        cx={anomaly.x_pct}
                        cy={anomaly.y_pct}
                        rx={anomaly.radius_pct}
                        ry={anomaly.radius_pct * (imageWidth / imageHeight)}
                        className="fill-info/20 stroke-info stroke-[1.5]"
                      />
                    ))}

                  {drawnCircle && (
                    <ellipse
                      cx={drawnCircle.x_pct}
                      cy={drawnCircle.y_pct}
                      rx={drawnCircle.radius_pct}
                      ry={drawnCircle.radius_pct * (imageWidth / imageHeight)}
                      className={
                        drawnCircle.result === "correct"
                          ? "fill-emerald-500/20 stroke-emerald-500 stroke-[2]"
                          : drawnCircle.result === "incorrect"
                            ? "fill-rose-500/20 stroke-rose-500 stroke-[2]"
                            : "fill-amber-400/20 stroke-amber-400 stroke-[1.5] [stroke-dasharray:3_3]"
                      }
                    />
                  )}
                </svg>
              </div>
            </div>
          </div>

          {/* === PHẦN 2: CÂU HỎI / LOG / REVIEW === */}
          {activeAnomaly && activeQuiz ? (
            <form
              onSubmit={handleQuizSubmit}
              className={`${gamePanel} max-h-[45dvh] min-h-0 overflow-y-auto border-t-2 border-ink md:border-t-0 md:max-h-[calc(100dvh-90px)]`}
              aria-labelledby="forensics-question"
            >
              <div className={gameSectionBar}>
                {t("module.common.criticalThinking")}
              </div>

              <div className="p-3">
                <p
                  className="text-sm font-bold leading-6"
                  id="forensics-question"
                >
                  {activeQuiz.question}
                </p>

                <div className="mt-3 space-y-1">
                  {activeQuiz.options.map((option) => (
                    <label
                      key={option}
                      className={gameOption}
                    >
                      <input
                        type="radio"
                        name={`forensics-${activeAnomaly.anomaly_id}`}
                        value={option}
                        checked={selectedOption === option}
                        onChange={(event) =>
                          setSelectedOption(event.target.value)
                        }
                        className="mt-0.5"
                      />

                      <span>{option}</span>
                    </label>
                  ))}
                </div>

                {quizState === "incorrect" && (
                  <p
                    className={`mt-3 ${gameFeedbackError}`}
                    role="alert"
                  >
                    {t("module.image.quizError")}
                  </p>
                )}

                <ProgressiveHint
                  available={quizMisses >= 1}
                  hints={[
                    t("module.hint.quiz.compareEvidence"),
                    t("module.hint.quiz.rejectAssumption"),
                  ]}
                />

                {quizState === "correct" && (
                  <div
                    className={`mt-3 ${gameFeedbackSuccess}`}
                    role="status"
                  >
                    <p className="font-bold">
                      {t("module.common.correct")}
                    </p>

                    {activeQuiz.explanation && (
                      <p>{activeQuiz.explanation}</p>
                    )}
                  </div>
                )}

                <div className="mt-3 flex justify-end gap-2 border-t-2 border-ink bg-surface pt-3 max-sm:[&>button]:w-full">
                  {quizState === "correct" ? (
                    <button
                      type="button"
                      onClick={handleContinue}
                      className={gameButton}
                    >
                      {hasRequiredEvidence
                        ? t("module.image.reviewEvidence")
                        : t("module.common.continue")}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!selectedOption}
                      className={gameButton}
                    >
                      {t("module.common.checkAnswer")}
                    </button>
                  )}
                </div>
              </div>
            </form>
          ) : isReviewingEvidence ? (
            <div
              className={`${gamePanel} max-h-[calc(100dvh-90px)] overflow-y-auto border-t-2 border-ink md:border-t-0`}
            >
              <div className={gameSectionBar}>
                {t("module.image.reviewTitle")}
              </div>

              <div className="p-3">
                <p className="text-sm leading-6">
                  {t("module.image.reviewSummary")}
                </p>

                <div className="mt-4 space-y-2 border-y-2 border-ink py-3 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-4 rounded-full border-2 border-dashed border-accent bg-accent/20"
                      aria-hidden
                    />
                    <span>
                      {t("module.image.userMarkLegend")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="size-4 rounded-full border-2 border-info bg-info/20"
                      aria-hidden
                    />
                    <span>
                      {t("module.image.verifiedAreaLegend")}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onComplete}
                  className={`mt-4 w-full ${gameButton}`}
                >
                  {t("module.image.continueToText")}
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`${gamePanel} max-h-[calc(100dvh-90px)] overflow-y-auto border-t-2 border-ink md:border-t-0`}
            >
              <div className={gameSectionBar}>
                {t("module.image.log")}
              </div>

              <div className="p-3">
                <p className="text-sm leading-6">
                  {contextText}
                </p>

                <div className="mt-4 border-t-2 border-ink pt-3 font-mono text-xs font-bold text-ink-soft">
                  {t("module.image.evidenceFound", {
                    found: foundAnomalyIds.length,
                    total: requiredEvidenceCount,
                  })}
                </div>

                {clickMessage && (
                  <p
                    className={`mt-3 ${gameFeedbackError}`}
                    role="alert"
                  >
                    {clickMessage}
                  </p>
                )}

                <ProgressiveHint
                  available={
                    evidenceMisses >= HINT_ATTEMPT_THRESHOLD
                  }
                  hints={[
                    t("module.hint.image.inspect"),
                    t("module.hint.image.focus", {
                      vertical: verticalArea,
                      horizontal: horizontalArea,
                    }),
                  ]}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </RetroWindow>
  );
}

export default ImageForensics;