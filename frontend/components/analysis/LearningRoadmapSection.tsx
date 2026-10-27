/**
 * Copyright (c) 2026 AURA FARMING 20 PRO MAX
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use client";

import React, { useState } from "react";
import { RoadmapNode } from "@/types/analysis";

interface LearningRoadmapSectionProps {
  roadmapNodes: RoadmapNode[];
}

export default function LearningRoadmapSection({
  roadmapNodes,
}: LearningRoadmapSectionProps) {
  // Allow user to click any node to view its resources
  const [selectedNodeId, setSelectedNodeId] = useState<string>("node-2");

  const selectedNode =
    roadmapNodes.find((n) => n.id === selectedNodeId) || roadmapNodes[1];

  return (
    <section className="bg-surface rounded-lg p-6 sm:p-8 shadow-xs border border-border/80 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-xs shrink-0">
            3
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-text">
            Lộ trình học tập đề xuất (Learning Roadmap)
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted pl-9.5">
          Lộ trình tối ưu từ Level hiện tại (68%) đến Target level (100% sẵn sàng chinh phục phỏng vấn)
        </p>
      </div>

      {/* Horizontal Multi-Node Timeline */}
      <div className="w-full overflow-x-auto pb-4">
        <div className="min-w-[760px] flex items-center justify-between relative py-4 px-2">
          {/* Background continuous track line */}
          <div className="absolute top-10 left-12 right-12 h-1 bg-border/80 -z-0" />

          {/* Start Node */}
          <div className="flex flex-col items-center gap-2 text-center max-w-[120px] z-10 shrink-0">
            <div className="w-12 h-12 rounded-full bg-surface-2 border border-border text-text flex items-center justify-center font-bold text-sm shadow-xs">
              68%
            </div>
            <span className="text-xs font-bold text-text">Level hiện tại</span>
            <span className="text-[11px] text-muted">Fresher / Intern</span>
          </div>

          <svg className="w-5 h-5 text-primary shrink-0 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>

          {/* Node 1: Completed */}
          <div
            onClick={() => setSelectedNodeId(roadmapNodes[0]?.id || "node-1")}
            className="flex flex-col items-center gap-2 text-center max-w-[160px] z-10 shrink-0 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <span className="text-xs font-bold text-text group-hover:text-primary transition-colors">
              {roadmapNodes[0]?.title}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 text-muted font-semibold border border-border">
              {roadmapNodes[0]?.duration}
            </span>
          </div>

          <svg className="w-5 h-5 text-primary shrink-0 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>

          {/* Node 2: Active (Currently Selected) */}
          <div
            onClick={() => setSelectedNodeId(roadmapNodes[1]?.id || "node-2")}
            className="flex flex-col items-center gap-2 text-center max-w-[180px] z-10 shrink-0 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg ring-4 ring-primary/25 animate-pulse">
              <svg className="w-7 h-7 text-accent" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.75 3a.75.75 0 00-1.5 0v1.077A7.502 7.502 0 004.5 11.25a7.48 7.48 0 002.58 5.679.75.75 0 001.018-.088l2.023-2.023a3 3 0 014.237 0l2.023 2.023a.75.75 0 001.018.088A7.48 7.48 0 0019.5 11.25a7.502 7.502 0 00-6.75-7.173V3z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-primary">
              {roadmapNodes[1]?.title}
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary-soft text-primary font-bold border border-primary/20">
              {roadmapNodes[1]?.duration}
            </span>
          </div>

          <svg className="w-5 h-5 text-muted/60 shrink-0 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>

          {/* Node 3: Locked */}
          <div className="flex flex-col items-center gap-2 text-center max-w-[150px] z-10 opacity-70 shrink-0">
            <div className="w-12 h-12 rounded-full bg-surface-2 text-muted border border-border flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-text">
              {roadmapNodes[2]?.title}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 text-muted border border-border">
              {roadmapNodes[2]?.duration}
            </span>
          </div>

          <svg className="w-5 h-5 text-muted/60 shrink-0 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>

          {/* Node 4: Locked */}
          <div className="flex flex-col items-center gap-2 text-center max-w-[140px] z-10 opacity-70 shrink-0">
            <div className="w-12 h-12 rounded-full bg-surface-2 text-muted border border-border flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-text">
              {roadmapNodes[3]?.title}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 text-muted border border-border">
              {roadmapNodes[3]?.duration}
            </span>
          </div>

          <svg className="w-5 h-5 text-primary shrink-0 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>

          {/* Goal Node */}
          <div className="flex flex-col items-center gap-2 text-center max-w-[120px] z-10 shrink-0">
            <div className="w-12 h-12 rounded-full bg-accent text-text font-bold text-sm flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.072 0H8.928m5.072 0l-1.072-6.435A1.5 1.5 0 0011.455 6.75h-.91a1.5 1.5 0 00-1.473 1.065L7.999 14.25m6.002 0h-6" />
              </svg>
            </div>
            <span className="text-xs font-bold text-text">100% Target</span>
            <span className="text-[11px] text-primary font-bold">Tự tin ứng tuyển</span>
          </div>
        </div>
      </div>

      {/* Expanded Resource Drawer for Active Node */}
      {selectedNode.resources && (
        <div className="bg-bg/80 border border-border/70 p-5 sm:p-6 rounded-md flex flex-col gap-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <h4 className="text-sm sm:text-base font-bold text-text">
                Tài nguyên được AI tinh gọn cho:{" "}
                <span className="text-primary">{selectedNode.title}</span>
              </h4>
            </div>
            <span className="text-xs text-muted">Thời lượng gợi ý: 20 giờ thực hành</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedNode.resources.map((res, i) => (
              <div
                key={i}
                className="p-4 bg-surface rounded-md border border-border/70 hover:border-primary/40 hover:shadow-sm transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary-soft text-primary w-fit font-bold">
                    {res.typeLabel}
                  </span>
                  <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">
                    {res.title}
                  </p>
                  <p className="text-xs text-muted leading-relaxed">
                    {res.description}
                  </p>
                </div>

                {res.url ? (
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center text-primary text-xs font-semibold gap-1 pt-2 hover:underline"
                  >
                    <span>{res.linkText}</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                ) : (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-full bg-primary text-on-primary text-xs font-semibold hover:opacity-95 transition-all shadow-xs"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                    </svg>
                    {res.actionText || res.linkText}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
