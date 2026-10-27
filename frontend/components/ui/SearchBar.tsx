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

import React from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  isFilterActive?: boolean;
  onToggleFilter?: () => void;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Tìm kiếm theo vị trí hoặc ngày phân tích...",
  isFilterActive = false,
  onToggleFilter,
  className = "",
}: SearchBarProps) {
  return (
    <div className={`flex items-center gap-2.5 w-full sm:w-auto ${className}`}>
      {/* Search Input Container */}
      <div className="relative flex-1 sm:w-80 md:w-96 flex items-center">
        {/* Magnifying Glass Icon */}
        <div className="absolute left-3.5 pointer-events-none text-muted">
          <svg
            className="w-4 h-4 sm:w-4.5 sm:h-4.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>

        {/* Input Field */}
        <input
          type="text"
          id="history-search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2 sm:py-2.5 text-xs sm:text-sm bg-surface text-text placeholder:text-muted/70 border border-border rounded-xl transition-all duration-150 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/15 shadow-2xs"
          aria-label="Tìm kiếm lịch sử phân tích"
        />

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              onClear?.();
            }}
            className="absolute right-2.5 p-1 text-muted hover:text-text rounded-full hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Xóa nội dung tìm kiếm"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter Button */}
      <button
        type="button"
        id="history-filter-toggle-button"
        onClick={onToggleFilter}
        className={`p-2 sm:p-2.5 rounded-xl border transition-all duration-150 shrink-0 cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          isFilterActive
            ? "bg-primary text-on-primary border-primary hover:bg-primary/90"
            : "bg-surface text-muted border-border hover:text-text hover:bg-surface-2"
        }`}
        aria-label="Bộ lọc nâng cao"
        title="Lọc phân loại công việc"
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
          />
        </svg>
      </button>
    </div>
  );
}
