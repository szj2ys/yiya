"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  TrendingUp,
  Flame,
  Share2,
  ShoppingCart,
  Activity,
  ChevronRight,
  Trophy,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  calculateConversionData,
  analyzeABTest,
  formatPercent,
  formatCurrency,
  type ConversionData,
} from "@/lib/admin/ab-analytics";
import { getVariantMetadata } from "@/lib/ab-testing";
import {
  generateMockCohortData,
  calculateCohortSummary,
  formatRetentionRate,
  getRetentionColorClass,
  getAverageRetentionCurve,
  type CohortData,
  type Granularity,
  RETENTION_DAYS,
} from "@/lib/admin/cohort-analytics";

// Analytics event definitions from lib/analytics.ts
const TRACKED_EVENTS = [
  { name: "page_view", category: "Navigation", icon: Activity },
  { name: "lesson_start", category: "Learning", icon: BookOpen },
  { name: "lesson_complete", category: "Learning", icon: BookOpen },
  { name: "lesson_fail", category: "Learning", icon: BookOpen },
  { name: "lesson_share", category: "Viral", icon: Share2 },
  { name: "lesson_share_prompt_shown", category: "Viral", icon: Share2 },
  { name: "paywall_view", category: "Conversion", icon: ShoppingCart },
  { name: "checkout_start", category: "Conversion", icon: ShoppingCart },
  { name: "checkout_complete", category: "Conversion", icon: ShoppingCart },
  { name: "paywall_variant_shown", category: "A/B Test", icon: Activity },
  { name: "paywall_conversion_by_variant", category: "A/B Test", icon: Activity },
  { name: "paywall_start_checkout", category: "A/B Test", icon: Activity },
  { name: "paywall_complete", category: "A/B Test", icon: Activity },
  { name: "quest_reminder_sent", category: "Retention", icon: Flame },
  { name: "quest_reminder_clicked", category: "Retention", icon: Flame },
  { name: "signup_completed", category: "Acquisition", icon: Users },
  { name: "first_lesson_started", category: "Activation", icon: BookOpen },
  { name: "user_activated", category: "Activation", icon: Users },
  { name: "streak_saved", category: "Retention", icon: Flame },
  { name: "streak_risk_shown", category: "Retention", icon: Flame },
  { name: "streak_risk_clicked", category: "Retention", icon: Flame },
  { name: "empty_state_shown", category: "Activation", icon: Activity },
  { name: "empty_state_cta_clicked", category: "Activation", icon: Activity },
];

type MetricCardProps = {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ElementType;
};

const MetricCard = ({ title, value, change, trend, icon: Icon }: MetricCardProps) => (
  <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
        <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">{value}</p>
        {change && (
          <p className={`mt-1 text-sm ${
            trend === "up" ? "text-green-600" :
            trend === "down" ? "text-red-600" :
            "text-neutral-500"
          }`}>
            {change}
          </p>
        )}
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
        <Icon className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
      </div>
    </div>
  </div>
);

const ABTestResults = ({ data }: { data: ConversionData[] }) => {
  const analysis = useMemo(() => analyzeABTest(data), [data]);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          Paywall A/B Test Results
        </h3>
        {analysis.isSignificant && analysis.winner && (
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
            <Trophy className="h-3 w-3" />
            Winner: {getVariantMetadata(analysis.winner).name}
          </span>
        )}
      </div>

      {/* Conversion Table */}
      <div className="space-y-3">
        {data.map((variant) => {
          const meta = getVariantMetadata(variant.variant);
          const isWinner = analysis.winner === variant.variant;
          const isBestConversion = variant.conversionRate === Math.max(...data.map(d => d.conversionRate));

          return (
            <div
              key={variant.variant}
              className={`p-3 rounded-lg border ${
                isWinner
                  ? "border-green-300 bg-green-50 dark:bg-green-950/30"
                  : "border-neutral-200 bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    Variant {variant.variant.toUpperCase()} ({meta.name})
                  </span>
                  {isBestConversion && !isWinner && (
                    <span className="text-xs text-amber-600">Leading</span>
                  )}
                </div>
                <span className="text-sm text-neutral-500">
                  {variant.impressions.toLocaleString()} impressions
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-neutral-500">Click Rate</p>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatPercent(variant.clickRate)}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500">Conversion</p>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatPercent(variant.conversionRate)}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500">Revenue</p>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(variant.revenue)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistical Significance */}
      <div className={`mt-4 p-3 rounded-lg border ${
        analysis.isSignificant
          ? "border-green-200 bg-green-50 dark:bg-green-950/50 dark:border-green-800"
          : "border-amber-200 bg-amber-50 dark:bg-amber-950/50 dark:border-amber-800"
      }`}>
        <div className="flex items-start gap-2">
          <AlertCircle className={`h-4 w-4 mt-0.5 ${
            analysis.isSignificant ? "text-green-600" : "text-amber-600"
          }`} />
          <div className="text-sm">
            <p className={analysis.isSignificant ? "text-green-800 dark:text-green-200" : "text-amber-800 dark:text-amber-200"}>
              <strong>Status:</strong> {analysis.isSignificant
                ? `Statistically significant result (p=${analysis.pValue.toFixed(3)})`
                : `Inconclusive (p=${analysis.pValue.toFixed(3)}). Need more data.`}
            </p>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400">
              Sample size: {analysis.sampleSize.toLocaleString()} total impressions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cohort Retention Components
const RetentionMetricCard = ({
  title,
  value,
  trend,
}: {
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
}) => (
  <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
    <p className="text-sm text-neutral-500 dark:text-neutral-400">{title}</p>
    <div className="flex items-center gap-2 mt-1">
      <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        {value}
      </span>
      {trend === "up" && (
        <span className="text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded">↑</span>
      )}
      {trend === "down" && (
        <span className="text-xs text-red-600 bg-red-100 px-1.5 py-0.5 rounded">↓</span>
      )}
    </div>
  </div>
);

const RetentionCurveChart = ({ cohorts }: { cohorts: CohortData[] }) => {
  const avgCurve = useMemo(() => getAverageRetentionCurve(cohorts), [cohorts]);

  if (cohorts.length === 0) return null;

  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
        Average Retention Curve
      </h4>
      <div className="relative h-48">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-neutral-400">
          <span>100%</span>
          <span>50%</span>
          <span>0%</span>
        </div>

        {/* Chart area */}
        <div className="ml-10 h-full flex items-end">
          <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="0" x2="800" y2="0" stroke="#e5e5e5" strokeWidth="1" />
            <line x1="0" y1="100" x2="800" y2="100" stroke="#e5e5e5" strokeWidth="1" />
            <line x1="0" y1="200" x2="800" y2="200" stroke="#e5e5e5" strokeWidth="1" />

            {/* Average retention curve */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              points={avgCurve
                .map((point, index) => {
                  const x = (index / (avgCurve.length - 1)) * 800;
                  const y = 200 - point.avgRate * 200;
                  return `${x},${y}`;
                })
                .join(" ")}
            />

            {/* Data points */}
            {avgCurve.map((point, index) => {
              const x = (index / (avgCurve.length - 1)) * 800;
              const y = 200 - point.avgRate * 200;
              return (
                <circle
                  key={point.day}
                  cx={x}
                  cy={y}
                  r="5"
                  fill="#10b981"
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="ml-10 flex justify-between text-xs text-neutral-400 mt-2">
          {RETENTION_DAYS.map((day) => (
            <span key={day}>Day {day}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const CohortRetentionMatrix = ({
  data,
  granularity,
  onGranularityChange,
}: {
  data: CohortData[];
  granularity: Granularity;
  onGranularityChange: (g: Granularity) => void;
}) => {
  const summary = useMemo(() => calculateCohortSummary(data), [data]);

  // Show only key retention days in matrix
  const matrixDays = [0, 1, 7, 30];

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Cohort Retention Analysis
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            Track user retention by signup cohort
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={granularity === "week" ? "default" : "primaryOutline"}
            size="sm"
            onClick={() => onGranularityChange("week")}
          >
            Weekly
          </Button>
          <Button
            variant={granularity === "month" ? "default" : "primaryOutline"}
            size="sm"
            onClick={() => onGranularityChange("month")}
          >
            Monthly
          </Button>
        </div>
      </div>

      {/* Retention Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <RetentionMetricCard
          title="Avg Day 1 Retention"
          value={formatRetentionRate(summary.avgDay1Retention)}
          trend={summary.trendDay1}
        />
        <RetentionMetricCard
          title="Avg Day 7 Retention"
          value={formatRetentionRate(summary.avgDay7Retention)}
          trend={summary.trendDay7}
        />
        <RetentionMetricCard
          title="Avg Day 30 Retention"
          value={formatRetentionRate(summary.avgDay30Retention)}
          trend={summary.trendDay30}
        />
      </div>

      {/* Cohort Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700">
              <th className="text-left py-2 px-2 font-medium text-neutral-500">Cohort</th>
              <th className="text-right py-2 px-2 font-medium text-neutral-500">Users</th>
              {matrixDays.map((day) => (
                <th key={day} className="text-center py-2 px-2 font-medium text-neutral-500">
                  Day {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 8).map((cohort) => (
              <tr
                key={cohort.cohortDate}
                className="border-b border-neutral-100 dark:border-neutral-800 last:border-0"
              >
                <td className="py-2 px-2 font-medium text-neutral-900 dark:text-neutral-100">
                  {cohort.cohortLabel}
                </td>
                <td className="text-right py-2 px-2 text-neutral-500">
                  {cohort.size.toLocaleString()}
                </td>
                {matrixDays.map((day) => {
                  const retentionPoint = cohort.retention.find((r) => r.day === day);
                  const rate = retentionPoint?.rate ?? 0;
                  return (
                    <td key={day} className="py-1 px-1">
                      <div
                        className={`inline-flex items-center justify-center w-16 py-1.5 rounded text-xs font-medium ${
                          getRetentionColorClass(rate)
                        }`}
                      >
                        {formatRetentionRate(rate)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Retention Curve Chart */}
      <RetentionCurveChart cohorts={data} />

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-neutral-500">
        <span>Retention:</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-green-600" />
          <span>&gt;50%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-green-400" />
          <span>25-50%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-yellow-400" />
          <span>15-25%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-orange-400" />
          <span>8-15%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-red-400" />
          <span>&lt;8%</span>
        </div>
      </div>
    </div>
  );
};

const EventsList = () => (
  <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
    <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4">
      Tracked Events ({TRACKED_EVENTS.length})
    </h3>
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {TRACKED_EVENTS.map((event) => (
        <div
          key={event.name}
          className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          <div className="flex items-center gap-3">
            <event.icon className="h-4 w-4 text-neutral-400" />
            <div>
              <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">{event.name}</p>
              <p className="text-xs text-neutral-500">{event.category}</p>
            </div>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600">
            Active
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default function AnalyticsDashboard() {
  const [mounted, setMounted] = useState(false);
  const [granularity, setGranularity] = useState<Granularity>("week");

  // Mock data - replace with real PostHog API call
  const mockConversionData: ConversionData[] = useMemo(() => [
    { variant: "a", impressions: 1247, clicks: 312, conversions: 89, revenue: 889.11, clickRate: 0.25, conversionRate: 0.285 },
    { variant: "b", impressions: 1234, clicks: 358, conversions: 112, revenue: 1118.88, clickRate: 0.29, conversionRate: 0.313 },
    { variant: "c", impressions: 1256, clicks: 389, conversions: 134, revenue: 1338.66, clickRate: 0.31, conversionRate: 0.344 },
  ], []);

  // Generate mock cohort data
  const mockCohortData: CohortData[] = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (granularity === "week" ? 70 : 180));
    return generateMockCohortData(startDate, endDate, granularity);
  }, [granularity]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Analytics Dashboard
            </h1>
            <p className="mt-1 text-neutral-500">
              Growth metrics, A/B tests, and cohort retention
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin">
              <Button variant="ghost">Back to Admin</Button>
            </Link>
            <a
              href="https://eu.posthog.com/project/YOUR_PROJECT_ID"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary">Open PostHog</Button>
            </a>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Users"
            value="—"
            icon={Users}
          />
          <MetricCard
            title="Daily Active Users"
            value="—"
            icon={Activity}
          />
          <MetricCard
            title="Lessons Today"
            value="—"
            icon={BookOpen}
          />
          <MetricCard
            title="Conversion Rate"
            value="—"
            icon={TrendingUp}
          />
        </div>

        {/* Cohort Retention Analysis */}
        <div className="mb-8">
          <CohortRetentionMatrix
            data={mockCohortData}
            granularity={granularity}
            onGranularityChange={setGranularity}
          />
        </div>

        {/* A/B Test & Events */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ABTestResults data={mockConversionData} />
          <EventsList />
        </div>

        {/* Quick Links */}
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Quick Links
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <a
              href="https://eu.posthog.com/insights"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
            >
              <span className="font-medium">PostHog Insights</span>
              <ChevronRight className="h-4 w-4" />
            </a>
            <a
              href="https://eu.posthog.com/events"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
            >
              <span className="font-medium">Live Events</span>
              <ChevronRight className="h-4 w-4" />
            </a>
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
            >
              <span className="font-medium">Vercel Dashboard</span>
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Note */}
        <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Real-time metrics require PostHog API integration.
            This dashboard shows the structure. Connect to PostHog API for live data.
          </p>
        </div>
      </div>
    </div>
  );
}
