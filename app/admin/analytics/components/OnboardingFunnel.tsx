"use client";

import { useMemo } from "react";
import {
  Users,
  Target,
  Zap,
  Award,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export type OnboardingFunnelStep = {
  step: number;
  name: string;
  entered: number;
  completed: number;
  skipped?: number;
  avgDurationSeconds?: number;
};

export type OnboardingFunnelData = {
  steps: OnboardingFunnelStep[];
  totalStarted: number;
  totalActivated: number;
  activationRate: number;
};

// Mock data for demonstration - will be replaced with real PostHog API data
export const MOCK_ONBOARDING_FUNNEL: OnboardingFunnelData = {
  steps: [
    {
      step: 1,
      name: "Course Selection",
      entered: 1247,
      completed: 1185,
      avgDurationSeconds: 8,
    },
    {
      step: 2,
      name: "Try-it Quiz",
      entered: 1185,
      completed: 654,
      skipped: 412,
      avgDurationSeconds: 45,
    },
    {
      step: 3,
      name: "Daily Goal",
      entered: 1066,
      completed: 892,
      avgDurationSeconds: 12,
    },
    {
      step: 4,
      name: "Completion",
      entered: 892,
      completed: 892,
      avgDurationSeconds: 2,
    },
  ],
  totalStarted: 1247,
  totalActivated: 892,
  activationRate: 0.715,
};

const STEP_ICONS = [Target, Zap, Award, CheckCircle2];

const STEP_DESCRIPTIONS = [
  "Select language course",
  "Quick trial question",
  "Set daily learning goal",
  "Finish onboarding",
];

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

function calculateDropOffRate(step: OnboardingFunnelStep): number {
  if (step.entered === 0) return 0;
  return (step.entered - step.completed - (step.skipped ?? 0)) / step.entered;
}

function calculateCompletionRate(step: OnboardingFunnelStep): number {
  if (step.entered === 0) return 0;
  return step.completed / step.entered;
}

function calculateSkipRate(step: OnboardingFunnelStep): number {
  if (!step.skipped || step.entered === 0) return 0;
  return step.skipped / step.entered;
}

type OnboardingFunnelProps = {
  data?: OnboardingFunnelData;
};

export function OnboardingFunnel({ data = MOCK_ONBOARDING_FUNNEL }: OnboardingFunnelProps) {
  const processedSteps = useMemo(() => {
    return data.steps.map((step, index) => {
      const completionRate = calculateCompletionRate(step);
      const dropOffRate = calculateDropOffRate(step);
      const skipRate = calculateSkipRate(step);
      const conversionFromPrevious = index === 0 ? 1 : step.entered / data.steps[index - 1].completed;

      return {
        ...step,
        completionRate,
        dropOffRate,
        skipRate,
        conversionFromPrevious,
        icon: STEP_ICONS[index],
        description: STEP_DESCRIPTIONS[index],
      };
    });
  }, [data.steps]);

  const maxDropOffStep = useMemo(() => {
    return processedSteps.reduce((max, step) =>
      step.dropOffRate > max.dropOffRate ? step : max,
    processedSteps[0]);
  }, [processedSteps]);

  const avgTimeToActivate = useMemo(() => {
    const totalDuration = data.steps.reduce((sum, step) =>
      sum + (step.avgDurationSeconds ?? 0), 0);
    return totalDuration;
  }, [data.steps]);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Onboarding Funnel
          </h3>
          <p className="text-sm text-neutral-500">
            User journey from signup to activation
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-neutral-500">Activation Rate</p>
            <p className="text-2xl font-bold text-green-600">
              {(data.activationRate * 100).toFixed(1)}%
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
            <Users className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Funnel Steps */}
      <div className="space-y-4">
        {processedSteps.map((step, index) => {
          const Icon = step.icon;
          const isMaxDropOff = step.step === maxDropOffStep.step;
          const showWarning = isMaxDropOff && step.dropOffRate > 0.2;

          return (
            <div
              key={step.step}
              className={`relative rounded-xl border p-4 transition-all ${
                showWarning
                  ? "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30"
                  : "border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800"
              }`}
            >
              {/* Step Header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    showWarning
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                      : "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Step {step.step}: {step.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {step.description}
                    </p>
                  </div>
                </div>
                {showWarning && (
                  <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Highest drop-off
                  </div>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-4">
                {/* Entered */}
                <div className="text-center">
                  <p className="text-xs text-neutral-500">Entered</p>
                  <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {step.entered.toLocaleString()}
                  </p>
                  {index > 0 && (
                    <p className={`text-xs ${
                      step.conversionFromPrevious >= 0.9
                        ? "text-green-600"
                        : step.conversionFromPrevious >= 0.7
                          ? "text-amber-600"
                          : "text-red-600"
                    }`}>
                      {step.conversionFromPrevious >= 1
                        ? `${(step.conversionFromPrevious * 100).toFixed(0)}%`
                        : `${(step.conversionFromPrevious * 100).toFixed(0)}% from prev`}
                    </p>
                  )}
                </div>

                {/* Completion */}
                <div className="text-center">
                  <p className="text-xs text-neutral-500">Completed</p>
                  <p className="text-lg font-semibold text-green-600">
                    {step.completed.toLocaleString()}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {(step.completionRate * 100).toFixed(1)}%
                  </p>
                </div>

                {/* Skipped (if applicable) */}
                <div className="text-center">
                  <p className="text-xs text-neutral-500">Skipped</p>
                  <p className={`text-lg font-semibold ${
                    step.skipRate > 0 ? "text-amber-600" : "text-neutral-400"
                  }`}>
                    {(step.skipped ?? 0).toLocaleString()}
                  </p>
                  {step.skipRate > 0 && (
                    <p className="text-xs text-amber-600">
                      {(step.skipRate * 100).toFixed(1)}%
                    </p>
                  )}
                </div>

                {/* Drop-off */}
                <div className="text-center">
                  <p className="text-xs text-neutral-500">Drop-off</p>
                  <p className={`text-lg font-semibold ${
                    step.dropOffRate > 0.3 ? "text-red-600" : "text-neutral-600"
                  }`}>
                    {Math.round(step.dropOffRate * step.entered).toLocaleString()}
                  </p>
                  <p className={`text-xs ${
                    step.dropOffRate > 0.3
                      ? "text-red-600"
                      : step.dropOffRate > 0.15
                        ? "text-amber-600"
                        : "text-green-600"
                  }`}>
                    {(step.dropOffRate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Duration Bar (for steps with duration data) */}
              {step.avgDurationSeconds && step.avgDurationSeconds > 0 && (
                <div className="mt-3 flex items-center gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-700">
                  <TrendingDown className="h-4 w-4 text-neutral-400" />
                  <span className="text-xs text-neutral-500">Avg. time:</span>
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    {formatDuration(step.avgDurationSeconds)}
                  </span>
                </div>
              )}

              {/* Visual Progress Bar */}
              <div className="mt-3 h-2 rounded-full bg-neutral-200 dark:bg-neutral-700">
                <div
                  className={`h-full rounded-full transition-all ${
                    showWarning ? "bg-amber-500" : "bg-green-500"
                  }`}
                  style={{ width: `${step.completionRate * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="text-center">
          <p className="text-xs text-neutral-500">Started Onboarding</p>
          <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {data.totalStarted.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-neutral-500">Activated Users</p>
          <p className="text-xl font-bold text-green-600">
            {data.totalActivated.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-neutral-500">Avg. Time to Activate</p>
          <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatDuration(avgTimeToActivate)}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      {maxDropOffStep.dropOffRate > 0.2 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/50">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Optimization Opportunity
              </p>
              <p className="text-amber-700 dark:text-amber-300">
                Step {maxDropOffStep.step} ({maxDropOffStep.name}) has the highest drop-off rate at{" "}
                {(maxDropOffStep.dropOffRate * 100).toFixed(1)}%.
                Consider A/B testing a simplified version or adding a skip option.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
