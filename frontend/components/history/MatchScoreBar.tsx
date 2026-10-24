import React from "react";

interface MatchScoreBarProps {
  score: number; // 0 - 100
  className?: string;
}

export interface ScoreMeta {
  level: "optimal" | "promising" | "gap";
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  scoreColor: string;
  barColor: string;
  icon: React.ReactNode;
}

export function getScoreMeta(score: number): ScoreMeta {
  if (score >= 80) {
    return {
      level: "optimal",
      label: "Rất phù hợp",
      badgeBg: "bg-emerald-50",
      badgeText: "text-emerald-700",
      badgeBorder: "border-emerald-200",
      scoreColor: "text-emerald-600",
      barColor: "bg-emerald-500",
      icon: (
        <svg
          className="w-3.5 h-3.5 text-emerald-600 shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
            clipRule="evenodd"
          />
        </svg>
      ),
    };
  }

  if (score >= 50) {
    return {
      level: "promising",
      label: "Khả quan",
      badgeBg: "bg-orange-50",
      badgeText: "text-orange-700",
      badgeBorder: "border-orange-200",
      scoreColor: "text-orange-600",
      barColor: "bg-orange-500",
      icon: (
        <svg
          className="w-3.5 h-3.5 text-orange-600 shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.5A.75.75 0 002.75 12h6.572l-1.305 6.093a.75.75 0 001.292.657l8.5-9.5A.75.75 0 0017.25 8h-6.572l1.305-6.093z" />
        </svg>
      ),
    };
  }

  return {
    level: "gap",
    label: "Khoảng cách lớn",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    badgeBorder: "border-rose-200",
    scoreColor: "text-rose-600",
    barColor: "bg-rose-500",
    icon: (
      <svg
        className="w-3.5 h-3.5 text-rose-600 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };
}

export default function MatchScoreBar({ score, className = "" }: MatchScoreBarProps) {
  const meta = getScoreMeta(score);
  const clampedScore = Math.max(0, Math.min(100, score));

  return (
    <div className={`w-full max-w-xs ${className}`}>
      {/* Top row: Status badge + Percentage */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder}`}
        >
          {meta.icon}
          {meta.label}
        </span>
        <span className={`text-base sm:text-lg font-bold tracking-tight ${meta.scoreColor}`}>
          {clampedScore}%
        </span>
      </div>

      {/* Bottom row: Progress bar */}
      <div
        className="w-full h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={clampedScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Mức độ đáp ứng ${clampedScore}%`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${meta.barColor}`}
          style={{ width: `${clampedScore}%` }}
        />
      </div>
    </div>
  );
}
