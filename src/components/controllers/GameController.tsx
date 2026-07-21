"use client";

import { useCallback, useEffect, useState } from "react";
import ImageForensics from "../modules/ImageForensics";
import SortingGame from "../modules/SortingGame";
import TextHighlight from "../modules/TextHighlight";

export type GameStep = 1 | 2 | 3;

export interface SocraticQuiz {
  question?: string;
  push_question?: string;
  options: string[];
  correct_option?: string;
  explanation?: string;
}

export interface ImageAnomaly {
  anomaly_id: string;
  name: string;
  x_pct: number;
  y_pct: number;
  radius_pct: number;
  description: string;
  socratic_quiz?: SocraticQuiz;
}

export interface ImageForensicsModule {
  mechanic_type: string;
  image_url: string;
  context_text: string;
  image_width?: number;
  image_height?: number;
  target_anomalies: ImageAnomaly[];
  socratic_quiz: SocraticQuiz;
}

export interface TextHighlightTrap {
  trap_id: string;
  ground_truth_start: number;
  ground_truth_end: number;
  matched_text: string;
  weapon_type: string[];
  socratic_quiz: SocraticQuiz;
}

export interface TextHighlightModule {
  mechanic_type: string;
  simulated_post: {
    author: string;
    time_posted: string;
    content: string;
  };
  traps: TextHighlightTrap[];
}

export interface SortingPoolItem {
  item_id: string;
  text: string;
}

export interface SortingModule {
  mechanic_type: string;
  task_instruction: string;
  pool_items: SortingPoolItem[];
  correct_sequence: string[];
  validation_feedback: {
    success: string;
    failure: string;
  };
}

export interface CaseData {
  level: string;
  case_id: string;
  theme: string[];
  story_context: string;
  modules: {
    step_1_image_forensics: ImageForensicsModule;
    step_2_text_highlight: TextHighlightModule;
    step_3_sorting_game: SortingModule;
  };
}

export type GameCaseData = CaseData;

export interface GameControllerProps {
  caseData: GameCaseData;
  storageKey?: string;
}

const FIRST_STEP: GameStep = 1;
const LAST_STEP: GameStep = 3;
const STORAGE_VERSION = "v2";

function parseStoredStep(value: string | null): GameStep | null {
  const parsedValue = Number(value);

  if (parsedValue === 1 || parsedValue === 2 || parsedValue === 3) {
    return parsedValue;
  }

  return null;
}

function readStoredStep(storageKey: string): GameStep | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return parseStoredStep(window.localStorage.getItem(storageKey));
  } catch {
    return null;
  }
}

function writeStoredStep(storageKey: string, step: GameStep): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, String(step));
  } catch {
    return;
  }
}

function getQuizQuestion(quiz: SocraticQuiz): string {
  return quiz.question ?? quiz.push_question ?? "";
}

export default function GameController({
  caseData,
  storageKey,
}: GameControllerProps) {
  const persistenceKey =
    storageKey ??
    `unesco-mil-game:${STORAGE_VERSION}:${caseData.case_id}:current-step`;
  const [currentStep, setCurrentStep] = useState<GameStep>(FIRST_STEP);
  const [hasRestoredStep, setHasRestoredStep] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let cancelled = false;
    const restoreTimer = window.setTimeout(() => {
      if (cancelled) {
        return;
      }

      const storedStep = readStoredStep(persistenceKey);

      if (storedStep !== null) {
        setCurrentStep(storedStep);
      }

      setHasRestoredStep(true);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(restoreTimer);
    };
  }, [persistenceKey]);

  useEffect(() => {
    if (!hasRestoredStep) {
      return;
    }

    writeStoredStep(persistenceKey, currentStep);
  }, [currentStep, hasRestoredStep, persistenceKey]);

  const handleStepComplete = useCallback(() => {
    setCurrentStep((step) => {
      const nextStep = Math.min(step + 1, LAST_STEP) as GameStep;
      writeStoredStep(persistenceKey, nextStep);
      return nextStep;
    });
  }, [persistenceKey]);

  const handleStepBack = useCallback(() => {
    setCurrentStep((step) => {
      const previousStep = Math.max(step - 1, FIRST_STEP) as GameStep;
      writeStoredStep(persistenceKey, previousStep);
      return previousStep;
    });
  }, [persistenceKey]);

  let activeModule: React.ReactNode;

  switch (currentStep) {
    case 1: {
      const imageModule = caseData.modules.step_1_image_forensics;
      activeModule = (
        <ImageForensics
          imageUrl={imageModule.image_url}
          contextText={imageModule.context_text}
          imageWidth={imageModule.image_width}
          imageHeight={imageModule.image_height}
          targetAnomalies={imageModule.target_anomalies.map((anomaly) => ({
            ...anomaly,
            socratic_quiz: anomaly.socratic_quiz
              ? {
                  question: getQuizQuestion(anomaly.socratic_quiz),
                  options: anomaly.socratic_quiz.options,
                  correct_option: anomaly.socratic_quiz.correct_option,
                  explanation: anomaly.socratic_quiz.explanation,
                }
              : undefined,
          }))}
          socraticQuiz={{
            question: getQuizQuestion(imageModule.socratic_quiz),
            options: imageModule.socratic_quiz.options,
            correct_option: imageModule.socratic_quiz.correct_option,
            explanation: imageModule.socratic_quiz.explanation,
          }}
          onComplete={handleStepComplete}
          onBack={handleStepBack}
        />
      );
      break;
    }
    case 2: {
      const textModule = caseData.modules.step_2_text_highlight;

      activeModule = (
        <TextHighlight
          postAuthor={textModule.simulated_post.author}
          postTime={textModule.simulated_post.time_posted}
          content={textModule.simulated_post.content}
          traps={textModule.traps}
          iouThreshold={0.7}
          onComplete={handleStepComplete}
          onBack={handleStepBack}
        />
      );
      break;
    }
    case 3: {
      const sortingModule = caseData.modules.step_3_sorting_game;

      activeModule = (
        <SortingGame
          poolItems={sortingModule.pool_items.map((item) => ({
            id: item.item_id,
            text: item.text,
          }))}
          correctSequence={sortingModule.correct_sequence}
          validationFeedback={sortingModule.validation_feedback}
          onComplete={handleStepComplete}
          onBack={handleStepBack}
        />
      );
      break;
    }
  }

  return activeModule;
}





// nguoi dep trai 2 was here
