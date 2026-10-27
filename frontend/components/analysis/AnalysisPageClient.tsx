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

import React, { useState, useEffect } from "react";
import { AnalysisDetailData } from "@/types/analysis";
import { getAnalysisDetail, confirmSkillStatus } from "@/services/analysisService";
import AnalysisHeroSummary from "./AnalysisHeroSummary";
import SkillGapSection from "./SkillGapSection";
import SkillConfirmationSection from "./SkillConfirmationSection";
import LearningRoadmapSection from "./LearningRoadmapSection";
import SmartInterviewSection from "./SmartInterviewSection";

interface AnalysisPageClientProps {
  analysisId?: string;
}

export default function AnalysisPageClient({
  analysisId,
}: AnalysisPageClientProps) {
  const [data, setData] = useState<AnalysisDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getAnalysisDetail(analysisId)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || "Không thể tải báo cáo phân tích.");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [analysisId]);

  const handleConfirmSkill = async (
    skillId: string,
    level: "proficient" | "basic" | "unknown"
  ) => {
    if (!data) return;
    try {
      await confirmSkillStatus(data.id, skillId, level);
    } catch (e) {
      console.error("Lỗi cập nhật skill:", e);
    }
  };

  if (isLoading) {
    return (
      <main className="w-full min-h-screen pt-24 pb-16 bg-bg text-text">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8 animate-pulse">
          {/* Top Hero Skeleton */}
          <div className="h-8 w-64 bg-surface-2 rounded-md" />
          <div className="h-44 bg-surface rounded-lg border border-border" />
          {/* Section 1 Skeleton */}
          <div className="h-80 bg-surface rounded-lg border border-border" />
          {/* Section 2 Skeleton */}
          <div className="h-48 bg-surface rounded-lg border border-border" />
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="w-full min-h-screen pt-28 pb-16 bg-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface border border-border rounded-lg p-6 text-center flex flex-col items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-text">Đã có lỗi xảy ra</h3>
          <p className="text-sm text-muted">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2 rounded-full bg-primary text-on-primary text-sm font-semibold shadow-xs"
          >
            Tải lại trang
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen pt-24 pb-20 bg-bg text-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col w-full relative pb-10">
          {/* Ambient Subtle Glow */}
          <div className="absolute top-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-96 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* PAGE HEADER & HERO METRIC CARD */}
          <AnalysisHeroSummary data={data} />

          {/* STACKED CONTENT SECTIONS */}
          <div className="flex flex-col gap-8">
            {/* 1. BẢNG SO SÁNH SKILL GAP */}
            <SkillGapSection
              radarAxes={data.radarAxes}
              skillGaps={data.skillGaps}
            />

            {/* 2. XÁC NHẬN SKILL */}
            <SkillConfirmationSection
              activeSkillPrompt={data.activeSkillPrompt}
              skillsToVerify={data.skillsToVerify}
              onConfirmSkill={handleConfirmSkill}
            />

            {/* 3. LỘ TRÌNH HỌC TẬP ĐỀ XUẤT */}
            <LearningRoadmapSection roadmapNodes={data.roadmapNodes} />

            {/* 4. BỘ CÂU HỎI PHỎNG VẤN THÔNG MINH */}
            <SmartInterviewSection
              interviewQuestions={data.interviewQuestions}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
