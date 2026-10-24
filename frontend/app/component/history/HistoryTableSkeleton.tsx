"use client";

import React from "react";

interface HistoryTableSkeletonProps {
  rows?: number;
}

export default function HistoryTableSkeleton({
  rows = 7,
}: HistoryTableSkeletonProps) {
  return (
    <div className="w-full animate-pulse" aria-busy="true" aria-label="Đang tải dữ liệu">
      {/* Top Header Section Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-border/70">
        {/* Left: Icon + Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-2 shrink-0" />
          <div className="space-y-2">
            <div className="h-4 sm:h-5 w-44 sm:w-56 bg-surface-2 rounded-md" />
            <div className="h-3 sm:h-3.5 w-60 sm:w-72 bg-surface-2/70 rounded-md" />
          </div>
        </div>

        {/* Right: Score Legend Skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-3 w-20 bg-surface-2/60 rounded-md" />
          <div className="h-3 w-16 bg-surface-2/60 rounded-md" />
          <div className="h-3 w-16 bg-surface-2/60 rounded-md" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          {/* Header Row */}
          <thead>
            <tr className="bg-surface-2/60 text-muted text-xs uppercase tracking-wider rounded-xl">
              <th className="py-3 px-4 sm:px-6 rounded-l-xl w-[22%]">
                <div className="h-3 w-24 bg-surface-2 rounded" />
              </th>
              <th className="py-3 px-4 sm:px-6 w-[34%]">
                <div className="h-3 w-28 bg-surface-2 rounded" />
              </th>
              <th className="py-3 px-4 sm:px-6 w-[28%]">
                <div className="h-3 w-36 bg-surface-2 rounded" />
              </th>
              <th className="py-3 px-4 sm:px-6 rounded-r-xl text-right w-[16%]">
                <div className="h-3 w-16 bg-surface-2 rounded ml-auto" />
              </th>
            </tr>
          </thead>

          {/* Body Rows */}
          <tbody className="divide-y divide-border/60">
            {Array.from({ length: rows }).map((_, index) => (
              <tr key={index} className="py-4">
                {/* Col 1: Date & Time */}
                <td className="py-4 px-4 sm:px-6 align-middle">
                  <div className="space-y-1.5">
                    <div className="h-4 w-24 bg-surface-2 rounded" />
                    <div className="h-3 w-12 bg-surface-2/60 rounded" />
                  </div>
                </td>

                {/* Col 2: Position & Company */}
                <td className="py-4 px-4 sm:px-6 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-2 shrink-0" />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="h-4 w-3/4 max-w-[180px] bg-surface-2 rounded" />
                      <div className="h-3 w-1/2 max-w-[120px] bg-surface-2/70 rounded" />
                    </div>
                  </div>
                </td>

                {/* Col 3: Match Score Bar */}
                <td className="py-4 px-4 sm:px-6 align-middle">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="h-3 w-12 bg-surface-2 rounded" />
                      <div className="h-3 w-16 bg-surface-2/60 rounded" />
                    </div>
                    <div className="h-2.5 w-full bg-surface-2 rounded-full" />
                  </div>
                </td>

                {/* Col 4: Action Buttons */}
                <td className="py-4 px-4 sm:px-6 align-middle text-right">
                  <div className="inline-flex items-center justify-end gap-1.5">
                    <div className="w-8 h-8 rounded-lg bg-surface-2" />
                    <div className="w-8 h-8 rounded-lg bg-surface-2" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
