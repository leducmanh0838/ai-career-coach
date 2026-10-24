"use client";

import React, { useState } from "react";
import { InterviewQuestionItem } from "@/types/analysis";

interface SmartInterviewSectionProps {
  interviewQuestions: InterviewQuestionItem[];
}

export default function SmartInterviewSection({
  interviewQuestions,
}: SmartInterviewSectionProps) {
  const [selectedSeniority, setSelectedSeniority] = useState<
    "junior" | "middle" | "senior"
  >("junior");

  // Filter questions based on selected seniority tab
  const filteredQuestions = interviewQuestions.filter(
    (q) => q.seniority === selectedSeniority
  );

  return (
    <section className="bg-surface rounded-lg p-6 sm:p-8 shadow-xs border border-border/80 flex flex-col gap-6">
      {/* Header & Seniority Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-xs shrink-0">
              4
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-text">
              Bộ câu hỏi phỏng vấn thông minh (Smart Mock Interview)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-muted pl-9.5">
            Mô phỏng phỏng vấn thực tế với câu hỏi chuẩn hoá từ phòng tuyển dụng Techcombank &amp; FPT Software
          </p>
        </div>

        {/* Seniority Filter Tabs */}
        <div className="inline-flex p-1 bg-bg border border-border/70 rounded-full shrink-0 text-xs font-semibold self-start md:self-auto">
          {(["junior", "middle", "senior"] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSelectedSeniority(level)}
              className={`px-4 py-1.5 rounded-full capitalize transition-all ${
                selectedSeniority === level
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-muted hover:text-text"
              }`}
            >
              {level === "junior" ? "Junior (Mặc định)" : level}
            </button>
          ))}
        </div>
      </div>

      {/* Question Cards Stack */}
      <div className="flex flex-col gap-4">
        {filteredQuestions.map((q) => {
          const hasAssessment = !!q.assessment;

          return (
            <div
              key={q.id}
              className="p-5 sm:p-6 bg-bg/70 border border-border/70 rounded-md flex flex-col gap-4 shadow-2xs hover:border-primary/30 transition-all"
            >
              {/* Card Meta Row */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-soft text-primary text-xs font-semibold border border-primary/20">
                    {q.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-2 text-muted text-xs font-medium border border-border">
                    {q.tag}
                  </span>
                </div>

                {hasAssessment && (
                  <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    AI đã chấm điểm
                  </div>
                )}
              </div>

              {/* Question Text */}
              <h4 className="text-base sm:text-lg font-bold text-text leading-snug">
                {q.question}
              </h4>

              {/* If user answered: Show Answer & AI Assessment */}
              {hasAssessment ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted">
                      Câu trả lời mẫu của bạn:
                    </label>
                    <div className="p-4 bg-surface rounded-md border border-border/80 text-sm text-text leading-relaxed italic">
                      &ldquo;{q.userAnswer}&rdquo;
                    </div>
                  </div>

                  {/* Actions & Score */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-muted hover:text-primary text-xs font-semibold transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                      Trả lời lại
                    </button>

                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold border border-primary/20">
                      Điểm: {q.score} / 10
                    </span>
                  </div>

                  {/* Embedded AI Assessment Panel */}
                  <div className="p-4 bg-surface rounded-md border border-primary/25 flex flex-col gap-3 shadow-xs">
                    <div className="flex items-center gap-2 text-primary">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      <span className="text-xs sm:text-sm font-bold">
                        Đánh giá chi tiết từ EduBot Coach
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.434.887 1.332 1.448 2.326 1.448h5c.783 0 1.538-.289 2.12-.816l.823-.746a1.5 1.5 0 00.49-1.11V16.5" />
                          </svg>
                          Điểm mạnh
                        </span>
                        <p className="text-xs text-text leading-relaxed">
                          {q.assessment?.strengths}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.516 0c.85.493 1.509 1.333 1.509 2.316V18" />
                          </svg>
                          Điểm cần cải thiện
                        </span>
                        <p className="text-xs text-text leading-relaxed">
                          {q.assessment?.improvements}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Unanswered Question Card Layout */
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-border/50">
                  <span className="text-xs text-muted">
                    {q.frequencyNote}
                  </span>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface text-text hover:text-primary border border-border text-xs font-semibold shadow-xs hover:bg-surface-2 transition active:scale-95"
                    >
                      <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                      </svg>
                      Trả lời thử
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-bold shadow-xs hover:opacity-95 transition active:scale-95"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      AI đánh giá
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
