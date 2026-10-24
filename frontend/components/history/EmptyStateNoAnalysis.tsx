"use client";

import React from "react";
import Link from "next/link";

interface EmptyStateNoAnalysisProps {
  className?: string;
}

export default function EmptyStateNoAnalysis({
  className = "",
}: EmptyStateNoAnalysisProps) {
  return (
    <div
      className={`py-12 sm:py-16 md:py-20 px-4 flex flex-col items-center justify-center text-center ${className}`}
    >
      {/* Visual Avatar with Robot + Sparkles Badge */}
      <div className="relative mb-5 sm:mb-6">
        {/* Soft Blue Circle Container */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#eef4ff] border border-[#dbeafe] flex items-center justify-center shadow-xs transition-transform duration-300 hover:scale-105">
          {/* Friendly Robot Head Icon */}
          <svg
            className="w-10 h-10 sm:w-12 sm:h-12 text-[#2563eb]"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Top Antenna */}
            <line
              x1="24"
              y1="6"
              x2="24"
              y2="13"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="24" cy="5" r="3" fill="currentColor" />

            {/* Side Ear Pins */}
            <rect
              x="8"
              y="21"
              width="3"
              height="8"
              rx="1.5"
              fill="currentColor"
            />
            <rect
              x="37"
              y="21"
              width="3"
              height="8"
              rx="1.5"
              fill="currentColor"
            />

            {/* Head Contour */}
            <rect
              x="11"
              y="13"
              width="26"
              height="24"
              rx="7"
              stroke="currentColor"
              strokeWidth="2.8"
              fill="currentColor"
              fillOpacity="0.08"
            />

            {/* Visor Area */}
            <rect
              x="15"
              y="17"
              width="18"
              height="11"
              rx="3.5"
              fill="currentColor"
            />

            {/* Glowing Eyes */}
            <circle cx="19.5" cy="22.5" r="1.75" fill="#ffffff" />
            <circle cx="28.5" cy="22.5" r="1.75" fill="#ffffff" />

            {/* Cheerful Smile */}
            <path
              d="M20 31c1.2 1.5 6.8 1.5 8 0"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Floating Orange Sparkle Badge */}
        <div
          className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#ea580c] to-[#f97316] text-white flex items-center justify-center shadow-md shadow-orange-500/30 border-2 border-white ring-1 ring-orange-200"
          title="AI thông minh"
        >
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {/* Sparkles / Stars Icon */}
            <path d="M12 2l1.8 4.6 4.7 1.8-4.7 1.8L12 15l-1.8-4.8L5.5 8.4l4.7-1.8L12 2zM19 14l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5z" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-text tracking-tight">
        Bạn chưa có lần phân tích nào
      </h3>

      {/* Subtitle */}
      <p className="text-xs sm:text-sm md:text-base text-muted max-w-lg mt-2 sm:mt-2.5 leading-relaxed font-normal">
        Tải lên CV của bạn cùng với bản mô tả công việc (JD) để AI phân tích
        khoảng cách kỹ năng ngay hôm nay. Hãy bắt đầu lộ trình sự nghiệp vững
        chắc!
      </p>

      {/* CTA Button */}
      <div className="mt-6 sm:mt-8">
        <Link
          href="/analysis"
          className="group inline-flex items-center gap-2.5 px-6 py-3 sm:px-7 sm:py-3.5 rounded-full bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white text-xs sm:text-sm md:text-base font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:from-[#ea580c] hover:to-[#c2410c] transition-all duration-200 active:scale-95 cursor-pointer"
        >
          {/* Document / CV Icon with Plus */}
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-white/95 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>

          <span>Phân tích CV ngay</span>

          {/* Right Chevron */}
          <svg
            className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white/90 group-hover:translate-x-0.5 transition-transform shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
