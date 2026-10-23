"use client";

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalRecords === 0) return null;

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  // Generate page numbers
  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/70 text-xs sm:text-sm ${className}`}
    >
      {/* Left: Summary text */}
      <p className="text-muted text-center sm:text-left">
        Hiển thị{" "}
        <span className="font-semibold text-text">
          {startRecord} – {endRecord}
        </span>{" "}
        trong tổng số <span className="font-semibold text-text">{totalRecords}</span> kết quả
      </p>

      {/* Right: Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
            currentPage <= 1
              ? "text-muted/40 cursor-not-allowed"
              : "text-muted hover:text-text hover:bg-surface-2"
          }`}
          aria-label="Trang trước"
        >
          <span>←</span>
          <span>Trước</span>
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1">
          {pages.map((p) => {
            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={isActive ? "page" : undefined}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-[#ea580c] text-white shadow-2xs"
                    : "text-muted hover:text-text hover:bg-surface-2"
                }`}
                aria-label={`Trang ${p}`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
            currentPage >= totalPages
              ? "text-muted/40 cursor-not-allowed"
              : "text-muted hover:text-text hover:bg-surface-2"
          }`}
          aria-label="Trang sau"
        >
          <span>Sau</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
