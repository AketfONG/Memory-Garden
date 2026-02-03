"use client";

import React from "react";

export type FlowType = "story-summary" | "ai-journal";

interface FloatingProgressBarProps {
  flow: FlowType;
  currentStep: number; // 0-based index
}

const STORY_STEPS = ["1", "2", "3", "✓"];
const AI_JOURNAL_STEPS = ["1", "✓"];

export default function FloatingProgressBar({ flow, currentStep }: FloatingProgressBarProps) {
  const steps = flow === "story-summary" ? STORY_STEPS : AI_JOURNAL_STEPS;
  const maxIndex = steps.length - 1;

  return (
    <div
      className="fixed right-4 top-1/2 -translate-y-1/2 left-auto z-30 lg:top-20 lg:right-auto lg:left-1/2 lg:-translate-x-1/2 lg:translate-y-0 flex flex-col lg:flex-row items-center gap-0.5 lg:gap-1 px-2 py-2 lg:px-4 lg:py-3 rounded-full bg-white/95 backdrop-blur-sm border-2 border-gray-200 shadow-lg"
      aria-label="Progress"
    >
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === maxIndex;
        const isActive = isCompleted || isCurrent;

        return (
          <React.Fragment key={index}>
            <div
              className={`
                flex items-center justify-center w-7 h-7 lg:w-9 lg:h-9 rounded-full text-xs lg:text-sm font-semibold transition-all duration-300 shadow-lg flex-shrink-0
                ${isActive ? "bg-gradient-to-b from-emerald-500 to-green-600 text-white" : ""}
                ${!isActive ? "bg-gray-200 text-gray-500" : ""}
              `}
              aria-current={isCurrent ? "step" : undefined}
            >
              {isCompleted ? (
                <span className="text-white" aria-hidden>✓</span>
              ) : (
                <span>{label}</span>
              )}
            </div>
            {!isLast && (
              <div
                className={`w-0.5 h-3 lg:w-8 lg:h-0.5 rounded transition-colors duration-300 flex-shrink-0 ${
                  index < currentStep ? "bg-gradient-to-b lg:bg-gradient-to-r from-emerald-500 to-green-600" : "bg-gray-200"
                }`}
                aria-hidden
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
