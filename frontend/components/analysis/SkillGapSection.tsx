"use client";

import React, { useState } from "react";
import { RadarAxis, SkillGapItem } from "@/types/analysis";

interface SkillGapSectionProps {
  radarAxes: RadarAxis[];
  skillGaps: SkillGapItem[];
}

export default function SkillGapSection({
  radarAxes,
  skillGaps,
}: SkillGapSectionProps) {
  const [viewMode, setViewMode] = useState<"radar" | "list">("radar");

  // Dynamic calculations for 6-axis Radar
  const centerX = 160;
  const centerY = 160;
  const maxRadius = 115; // level 5 radius
  const levels = [1, 2, 3, 4, 5];

  // Helper to calculate coordinates on regular hexagon (60° apart)
  const getCoordinates = (index: number, level: number) => {
    const angle = (index * 60 - 90) * (Math.PI / 180);
    const radius = (level / 5) * maxRadius;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y };
  };

  // Generate web polygon point strings
  const getPolygonPoints = (level: number) => {
    return [0, 1, 2, 3, 4, 5]
      .map((i) => {
        const { x, y } = getCoordinates(i, level);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  // Generate Candidate polygon points
  const candidatePolygonPoints = radarAxes
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, axis.candidateLevel);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // Generate Required polygon points
  const requiredPolygonPoints = radarAxes
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, axis.requiredLevel);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <section className="bg-surface rounded-lg p-6 sm:p-8 shadow-xs border border-border/80 flex flex-col gap-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-xs shrink-0">
              1
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-text">
              Bảng so sánh Skill Gap (Độ hẫng kỹ năng)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-muted pl-9.5">
            So sánh năng lực hiện tại trích xuất từ CV với tiêu chuẩn tuyển dụng vị trí Frontend Developer Intern
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="inline-flex p-1 bg-bg border border-border/70 rounded-full self-start md:self-auto shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setViewMode("radar")}
            className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              viewMode === "radar"
                ? "bg-primary text-on-primary shadow-xs"
                : "text-muted hover:text-text"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
            </svg>
            Biểu đồ Radar
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              viewMode === "list"
                ? "bg-primary text-on-primary shadow-xs"
                : "text-muted hover:text-text"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            Danh sách Tiến độ
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Radar Chart (5 Cols) */}
        <div className={`lg:col-span-5 flex flex-col items-center justify-center bg-bg/80 border border-border/60 p-6 rounded-md ${
          viewMode === "list" ? "hidden lg:flex" : "flex"
        }`}>
          <div className="w-full max-w-[340px] aspect-square relative flex items-center justify-center">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 320 320">
              {/* Concentric Hexagons */}
              {levels.map((lvl) => (
                <polygon
                  key={lvl}
                  className="stroke-border"
                  fill="none"
                  points={getPolygonPoints(lvl)}
                  strokeWidth={lvl === 5 ? "1.5" : "1"}
                  strokeDasharray={lvl === 5 ? "3 3" : undefined}
                />
              ))}

              {/* Axis lines radiating from center */}
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const { x, y } = getCoordinates(i, 5);
                return (
                  <line
                    key={i}
                    className="stroke-border"
                    strokeWidth="1.2"
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                  />
                );
              })}

              {/* Required Level Polygon (JD Level: Slate/Grey dashed line) */}
              <polygon
                fill="#12142a"
                fillOpacity="0.05"
                points={requiredPolygonPoints}
                stroke="#5a5f7a"
                strokeWidth="2"
                strokeDasharray="4 2"
                strokeLinejoin="round"
              />
              {radarAxes.map((axis, i) => {
                const { x, y } = getCoordinates(i, axis.requiredLevel);
                return (
                  <circle
                    key={`req-${i}`}
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill="#5a5f7a"
                  />
                );
              })}

              {/* Candidate Current Level Polygon (Primary Blue Brand Fill) */}
              <polygon
                fill="#3346f0"
                fillOpacity="0.22"
                points={candidatePolygonPoints}
                stroke="#3346f0"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {radarAxes.map((axis, i) => {
                const { x, y } = getCoordinates(i, axis.candidateLevel);
                return (
                  <circle
                    key={`cand-${i}`}
                    cx={x}
                    cy={y}
                    r="4.5"
                    fill="#3346f0"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Axis Labels */}
              <text className="fill-text text-[11px] font-bold" textAnchor="middle" x="160" y="16">
                JavaScript
              </text>
              <text className="fill-text text-[11px] font-bold" textAnchor="start" x="272" y="96">
                React
              </text>
              <text className="fill-text text-[11px] font-bold" textAnchor="start" x="272" y="235">
                HTML/CSS
              </text>
              <text className="fill-text text-[11px] font-bold" textAnchor="middle" x="160" y="310">
                Git
              </text>
              <text className="fill-text text-[11px] font-bold" textAnchor="end" x="48" y="235">
                SQL
              </text>
              <text className="fill-text text-[11px] font-bold" textAnchor="end" x="48" y="96">
                Giao tiếp
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-sm bg-primary" />
              <span className="text-text font-medium">Level hiện tại của bạn</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-sm border-2 border-dashed border-muted bg-surface-2" />
              <span className="text-text font-medium">Level yêu cầu JD</span>
            </div>
          </div>
        </div>

        {/* Right Column: Skill Gap Progress Bars (7 Cols) */}
        <div className={`flex flex-col gap-3 ${
          viewMode === "list" ? "col-span-12" : "lg:col-span-7"
        }`}>
          {skillGaps.map((item) => {
            const isMet = item.status === "met";
            const isMajorGap = item.status === "major_gap";

            return (
              <div
                key={item.id}
                className="p-3.5 bg-bg/70 hover:bg-bg rounded-md border border-border/60 transition-all flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-text">
                      {item.name}
                    </span>
                    <span className="text-xs text-muted font-medium">
                      ({item.candidateLevel}/5 vs {item.requiredLevel}/5)
                    </span>
                  </div>

                  {/* Status Badge */}
                  {isMet ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {item.gapText}
                    </span>
                  ) : isMajorGap ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                      {item.gapText}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-soft text-primary text-xs font-bold border border-primary/20">
                      {item.gapText}
                    </span>
                  )}
                </div>

                {/* Progress Bar with Dual Level Indicator */}
                <div className="relative w-full h-2.5 bg-surface-2 rounded-full overflow-hidden border border-border/50">
                  {/* Required Level Bar (Light Grey Base) */}
                  <div
                    className="absolute top-0 left-0 h-full bg-border rounded-full"
                    style={{ width: `${(item.requiredLevel / 5) * 100}%` }}
                  />
                  {/* Candidate Level Bar (Primary Color) */}
                  <div
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ${
                      isMet ? "bg-emerald-500" : isMajorGap ? "bg-amber-500" : "bg-primary"
                    }`}
                    style={{ width: `${(item.candidateLevel / 5) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
