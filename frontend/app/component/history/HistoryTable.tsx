"use client";

import React from "react";
import Link from "next/link";
import { AnalysisRecord, JobCategory } from "./HistoryMockData";
import MatchScoreBar from "./MatchScoreBar";

interface HistoryTableProps {
  records: AnalysisRecord[];
  totalCount: number;
}

// Category icon renderer with colors matching the design image
function getCategoryIcon(category: JobCategory) {
  switch (category) {
    case "frontend":
      return (
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-orange-50 border border-orange-200/60 text-orange-600 flex items-center justify-center shrink-0"
          title="Frontend Development"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
        </div>
      );
    case "mobile":
      return (
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0"
          title="Mobile Development"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
          </svg>
        </div>
      );
    case "design":
      return (
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-pink-50 border border-pink-200/60 text-pink-600 flex items-center justify-center shrink-0"
          title="UI/UX Design"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
          </svg>
        </div>
      );
    case "fullstack":
      return (
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center shrink-0"
          title="Fullstack Development"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
          </svg>
        </div>
      );
    case "backend":
      return (
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-50 border border-purple-200/60 text-purple-600 flex items-center justify-center shrink-0"
          title="Backend Engineering"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
          </svg>
        </div>
      );
    case "devops":
      return (
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center shrink-0"
          title="Cloud / DevOps"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
          </svg>
        </div>
      );
    case "data":
      return (
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-cyan-50 border border-cyan-200/60 text-cyan-600 flex items-center justify-center shrink-0"
          title="Data Science / Analysis"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
      );
    case "ai":
      return (
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-600 flex items-center justify-center shrink-0"
          title="AI / Machine Learning"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        </div>
      );
    default:
      return (
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-50 border border-slate-200/60 text-slate-600 flex items-center justify-center shrink-0"
          title="Chuyên ngành khác"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </div>
      );
  }
}

export default function HistoryTable({ records, totalCount }: HistoryTableProps) {
  return (
    <div className="w-full">
      {/* Card Header with Title, Count & Score Legend */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-border/70">
        {/* Left: Section Title & Count */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-text">
              Danh sách đánh giá gần đây
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              Tổng cộng {totalCount} lượt phân tích bằng mô hình AI Career Engine
            </p>
          </div>
        </div>

        {/* Right: Score Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <span className="text-muted font-medium">Chú thích điểm:</span>
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>≥ 80% Tối ưu</span>
          </div>
          <div className="flex items-center gap-1.5 text-orange-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
            <span>50% – 79% Khả quan</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>&lt; 50% Cần nâng cấp</span>
          </div>
        </div>
      </div>

      {/* Table Data View (Desktop & Tablet with Horizontal Scroll for narrow screens) */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          {/* Table Header Bar */}
          <thead>
            <tr className="bg-surface-2/60 text-muted text-xs font-semibold uppercase tracking-wider rounded-xl">
              <th scope="col" className="py-3 px-4 sm:px-6 rounded-l-xl w-[22%]">
                Ngày phân tích
              </th>
              <th scope="col" className="py-3 px-4 sm:px-6 w-[34%]">
                Vị trí mục tiêu
              </th>
              <th scope="col" className="py-3 px-4 sm:px-6 w-[28%]">
                Mức độ đáp ứng (Match score)
              </th>
              <th scope="col" className="py-3 px-4 sm:px-6 rounded-r-xl text-right w-[16%]">
                Hành động
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-border/60">
            {records.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-surface-2/40 transition-colors duration-150 group"
              >
                {/* Column 1: Date & Time */}
                <td className="py-4 px-4 sm:px-6 align-middle">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 text-muted/80">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.75}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text whitespace-nowrap">
                        {record.date}
                      </p>
                      <p className="text-xs text-muted font-normal mt-0.5">
                        {record.time}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Column 2: Target Position & Company */}
                <td className="py-4 px-4 sm:px-6 align-middle">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(record.category)}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text group-hover:text-primary transition-colors truncate">
                        {record.position}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
                        <svg
                          className="w-3.5 h-3.5 text-muted/70 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21"
                          />
                        </svg>
                        <span className="truncate">{record.company}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Column 3: Match Score */}
                <td className="py-4 px-4 sm:px-6 align-middle">
                  <MatchScoreBar score={record.matchScore} />
                </td>

                {/* Column 4: Action */}
                <td className="py-4 px-4 sm:px-6 align-middle text-right whitespace-nowrap">
                  <Link
                    href={`/history/${record.id}`}
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#c25e1a] hover:text-[#9a450c] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
                  >
                    <span>Xem chi tiết</span>
                    <span className="text-base leading-none transition-transform group-hover:translate-x-0.5">
                      ›
                    </span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
