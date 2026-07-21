import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import Image from "next/image";
import { RetroWindow } from "./RetroWindow";

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
  imageUrl: string;
  contextText: string;
  targetAnomalies: ImageForensicsAnomaly[];
  socraticQuiz?: ImageForensicsQuiz;
  imageWidth?: number;
  imageHeight?: number;
  onComplete?: () => void;
  onBack?: () => void;
}

type QuizState = "idle" | "incorrect" | "correct";

interface DrawnCircle {
  x_pct: number;
  y_pct: number;
  radius_pct: number;
  result: "pending" | "incorrect" | "correct";
}

function getOptionKey(option: string): string {
  return option.trim().charAt(0).toUpperCase();
}

export function ImageForensics({
  imageUrl,
  contextText,
  targetAnomalies,
  socraticQuiz,
  imageWidth = 16,
  imageHeight = 9,
  onComplete,
  onBack,
}: ImageForensicsProps) {
  const [foundAnomalyIds, setFoundAnomalyIds] = useState<string[]>([]);
  const [activeAnomalyId, setActiveAnomalyId] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [clickMessage, setClickMessage] = useState("");
  const [drawnCircle, setDrawnCircle] = useState<DrawnCircle | null>(null);
  const drawStartRef = useRef<{ x_pct: number; y_pct: number } | null>(null);

  const activeAnomaly = targetAnomalies.find(
    (anomaly) => anomaly.anomaly_id === activeAnomalyId,
  );
  const activeQuiz = activeAnomaly?.socratic_quiz ?? socraticQuiz;
  const allAnomaliesFound =
    targetAnomalies.length > 0 &&
    foundAnomalyIds.length === targetAnomalies.length;
  const imageStyle = {
    aspectRatio: `${imageWidth} / ${imageHeight}`,
  } satisfies CSSProperties;

  const getImagePoint = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x_pct: ((event.clientX - rect.left) / rect.width) * 100,
      y_pct: ((event.clientY - rect.top) / rect.height) * 100,
    };
  };

  const evaluateDrawnCircle = (circle: DrawnCircle) => {
    const selectedAnomaly = targetAnomalies.find((anomaly) => {
      const distance = Math.hypot(
        circle.x_pct - anomaly.x_pct,
        circle.y_pct - anomaly.y_pct,
      );

      return distance <= circle.radius_pct + anomaly.radius_pct;
    });

    if (!selectedAnomaly) {
      setDrawnCircle({ ...circle, result: "incorrect" });
      setClickMessage("No suspicious detail was found at that location.");
      return;
    }

    if (foundAnomalyIds.includes(selectedAnomaly.anomaly_id)) {
      setDrawnCircle({ ...circle, result: "incorrect" });
      setClickMessage("That anomaly is already in your investigation log.");
      return;
    }

    setDrawnCircle({ ...circle, result: "correct" });
    setClickMessage("");
    setActiveAnomalyId(selectedAnomaly.anomaly_id);
    setSelectedOption("");
    setQuizState("idle");
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (activeAnomalyId) {
      return;
    }

    event.preventDefault();
    const point = getImagePoint(event);
    drawStartRef.current = point;
    setClickMessage("");
    setDrawnCircle({ ...point, radius_pct: 0, result: "pending" });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drawStartRef.current || activeAnomalyId) {
      return;
    }

    const point = getImagePoint(event);
    const radius = Math.max(
      Math.hypot(
        point.x_pct - drawStartRef.current.x_pct,
        point.y_pct - drawStartRef.current.y_pct,
      ),
      0.5,
    );

    setDrawnCircle({
      ...drawStartRef.current,
      radius_pct: radius,
      result: "pending",
    });
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!drawStartRef.current || activeAnomalyId) {
      return;
    }

    const point = getImagePoint(event);
    const circle: DrawnCircle = {
      ...drawStartRef.current,
      radius_pct: Math.max(
        Math.hypot(
          point.x_pct - drawStartRef.current.x_pct,
          point.y_pct - drawStartRef.current.y_pct,
        ),
        5,
      ),
      result: "pending",
    };

    drawStartRef.current = null;
    evaluateDrawnCircle(circle);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerCancel = () => {
    drawStartRef.current = null;
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
      setQuizState("correct");
      return;
    }

    setQuizState("incorrect");
  };

  const handleContinue = () => {
    if (!activeAnomaly || quizState !== "correct") {
      return;
    }

    setActiveAnomalyId(null);
    setSelectedOption("");
    setQuizState("idle");
    setDrawnCircle(null);

    if (allAnomaliesFound) {
      onComplete?.();
    }
  };

  return (
    <RetroWindow title="Image Forensics Lab.exe" onClose={onBack}>
      <div className="grid gap-2 md:grid-cols-[1fr_240px]">
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          style={imageStyle}
          className="relative w-full touch-none cursor-crosshair overflow-hidden bg-black shadow-[inset_2px_2px_0_#000,inset_-2px_-2px_0_#dfdfdf,inset_4px_4px_0_#808080]"
        >
          <Image
            src={imageUrl}
            alt="Evidence"
            fill
            priority
            sizes="(min-width: 768px) calc(100vw - 260px), 100vw"
            draggable={false}
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0">
            {drawnCircle && (
              <div
                aria-label="Current drawn evidence circle"
                className={`absolute rounded-full border-2 ${
                  drawnCircle.result === "incorrect"
                    ? "border-red-500 bg-red-400/20"
                    : drawnCircle.result === "correct"
                      ? "border-green-500 bg-green-400/20"
                      : "border-yellow-300 bg-yellow-300/10"
                }`}
                style={{
                  left: `${drawnCircle.x_pct}%`,
                  top: `${drawnCircle.y_pct}%`,
                  width: `${drawnCircle.radius_pct * 2}%`,
                  height: "auto",
                  aspectRatio: "1",
                  transform: "translate(-50%, -50%)",
                }}
              />
            )}
            {targetAnomalies
              .filter((anomaly) =>
                foundAnomalyIds.includes(anomaly.anomaly_id),
              )
              .map((anomaly) => (
                <div
                  key={anomaly.anomaly_id}
                  aria-label={`${anomaly.name} found`}
                  className="absolute rounded-full border-2 border-green-500 bg-green-400/20 shadow-[0_0_0_1px_#000]"
                  style={{
                    left: `${anomaly.x_pct}%`,
                    top: `${anomaly.y_pct}%`,
                    width: `${anomaly.radius_pct * 2}%`,
                    height: `${anomaly.radius_pct * 2}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              ))}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_2px,rgba(0,0,0,0.15)_2px,rgba(0,0,0,0.15)_3px)]" />
        </div>

        <div className="bg-[#c0c0c0] p-2 shadow-[inset_-1px_-1px_0_#fff,inset_1px_1px_0_#808080]">
          <div className="mb-2 bg-[#000080] px-1 py-0.5 text-[10px] font-bold text-white">
            INVESTIGATION LOG
          </div>
          <p className="text-xs leading-snug">{contextText}</p>
          <div className="mt-3 border-t border-[#808080] pt-2 text-[10px] text-[#404040]">
            Evidence found: {foundAnomalyIds.length} / {targetAnomalies.length}
          </div>
          {clickMessage && (
            <p className="mt-2 bg-[#fff2a8] p-1 text-[10px] text-black">
              {clickMessage}
            </p>
          )}
          {allAnomaliesFound && !activeAnomaly && (
            <p className="mt-2 bg-[#d7ffd7] p-1 text-[10px] text-black">
              All visual anomalies are documented. Continue to the text investigation.
            </p>
          )}
        </div>
      </div>

      {activeAnomaly && activeQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleQuizSubmit}
            className="w-full max-w-lg bg-[#c0c0c0] p-1 text-black shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#fff,inset_-2px_-2px_0_#808080,inset_2px_2px_0_#fff]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="forensics-question"
          >
            <div className="bg-[#000080] px-2 py-1 text-xs font-bold text-white">
              Critical Thinking Check
            </div>
            <div className="p-3">
              <p className="text-xs font-bold" id="forensics-question">
                {activeQuiz.question}
              </p>
              <div className="mt-3 space-y-1">
                {activeQuiz.options.map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-start gap-2 bg-white px-2 py-1 text-xs shadow-[inset_1px_1px_0_#808080,inset_-1px_-1px_0_#fff]"
                  >
                    <input
                      type="radio"
                      name={`forensics-${activeAnomaly.anomaly_id}`}
                      value={option}
                      checked={selectedOption === option}
                      onChange={(event) => setSelectedOption(event.target.value)}
                      className="mt-0.5"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {quizState === "incorrect" && (
                <p className="mt-3 bg-[#ffd7d7] p-2 text-xs" role="alert">
                  That explanation does not match the selected anomaly. Try again.
                </p>
              )}
              {quizState === "correct" && (
                <div className="mt-3 bg-[#d7ffd7] p-2 text-xs" role="status">
                  <p className="font-bold">Correct.</p>
                  {activeQuiz.explanation && <p>{activeQuiz.explanation}</p>}
                </div>
              )}
              <div className="mt-3 flex justify-end gap-2">
                {quizState === "correct" ? (
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="min-w-[150px] bg-[#c0c0c0] px-3 py-1 text-xs shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#fff,inset_-2px_-2px_0_#808080,inset_2px_2px_0_#dfdfdf] active:shadow-[inset_1px_1px_0_#000,inset_-1px_-1px_0_#fff]"
                  >
                    {allAnomaliesFound ? "Continue to Text Highlight" : "Continue"}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!selectedOption}
                    className="min-w-[90px] bg-[#c0c0c0] px-3 py-1 text-xs shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#fff,inset_-2px_-2px_0_#808080,inset_2px_2px_0_#dfdfdf] enabled:active:shadow-[inset_1px_1px_0_#000,inset_-1px_-1px_0_#fff] disabled:cursor-not-allowed disabled:text-[#808080]"
                  >
                    Check Answer
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}
    </RetroWindow>
  );
}

export default ImageForensics;
