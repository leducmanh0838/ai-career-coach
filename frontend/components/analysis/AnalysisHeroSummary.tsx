"use client";

import React from "react";
import Link from "next/link";
import { AnalysisDetailData } from "@/types/analysis";

interface AnalysisHeroSummaryProps {
  data: AnalysisDetailData;
  onUploadNewCV?: () => void;
  onDownloadReport?: () => void;
}

export default function AnalysisHeroSummary({
  data,
  onUploadNewCV,
  onDownloadReport,
}: AnalysisHeroSummaryProps) {
  // SVG Circular calculation for 68% progress:
  // r = 42 -> C = 2 * PI * 42 ≈ 263.89
  const circumference = 263.89;
  const strokeDashoffset = circumference - (data.matchScore / 100) * circumference;

  return (
    <section className="flex flex-col gap-6 mb-8">
      {/* Top Breadcrumb & Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          {/* Status Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary font-semibold text-xs border border-primary/20">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Báo cáo phân tích chuyên sâu
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-2 text-muted text-xs border border-border">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {data.updatedAtText}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text tracking-tight">
            Chi tiết Phân tích
          </h1>
          <p className="text-sm sm:text-base text-muted max-w-3xl">
            Đánh giá năng lực dựa trên JD mục tiêu và hồ sơ cá nhân của bạn
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={onDownloadReport}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface text-text border border-border text-sm font-semibold shadow-xs hover:bg-surface-2 hover:shadow-sm transition-all active:scale-95"
          >
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Tải báo cáo PDF
          </button>

          <Link
            href="/#upload"
            onClick={onUploadNewCV}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-on-primary text-sm font-semibold shadow-md shadow-primary/25 hover:opacity-95 hover:shadow-lg transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Cập nhật CV mới
          </Link>
        </div>
      </div>

      {/* Match Hero Metric Card */}
      <div className="bg-surface rounded-lg p-6 sm:p-8 shadow-xs border border-border/80 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Soft Ambient Radial Tint */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-6 w-full md:w-auto text-center sm:text-left">
          {/* Circular Progress Meter */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                className="stroke-border"
                cx="50"
                cy="50"
                fill="transparent"
                r="42"
                strokeWidth="9"
              />
              <circle
                className="stroke-primary transition-all duration-1000 ease-out"
                cx="50"
                cy="50"
                fill="transparent"
                r="42"
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-text leading-none">
                {data.matchScore}%
              </span>
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider mt-1">
                Phù hợp
              </span>
            </div>
          </div>

          {/* Target Position Info */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-soft text-primary font-semibold">
                Vị trí tuyển dụng
              </span>
              <span className="text-xs text-muted font-medium">
                {data.company}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-text">
              {data.position}
            </h2>

            <div className="flex items-center justify-center sm:justify-start gap-2 text-muted text-sm">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent animate-pulse shrink-0" />
              <span>
                {data.summaryNote}
              </span>
            </div>
          </div>
        </div>

        {/* Quick KPI Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto shrink-0">
          <div className="bg-bg p-3.5 rounded-md flex flex-col items-center justify-center text-center border border-border/60 min-w-[100px]">
            <span className="text-lg font-bold text-text">{data.criteriaMet}</span>
            <span className="text-xs text-muted">Tiêu chí đạt</span>
          </div>

          <div className="bg-bg p-3.5 rounded-md flex flex-col items-center justify-center text-center border border-border/60 min-w-[100px]">
            <span className="text-lg font-bold text-accent">{data.roadmapDuration}</span>
            <span className="text-xs text-muted">Lộ trình bù đắp</span>
          </div>

          <div className="bg-bg p-3.5 rounded-md flex flex-col items-center justify-center text-center border border-border/60 col-span-2 sm:col-span-1 min-w-[100px]">
            <span className="text-lg font-bold text-primary">{data.prospectRank}</span>
            <span className="text-xs text-muted">Độ triển vọng</span>
          </div>
        </div>
      </div>
    </section>
  );
}
