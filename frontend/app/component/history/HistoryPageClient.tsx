"use client";

import React, { useState, useMemo } from "react";
import { MOCK_HISTORY, PAGE_SIZE, AnalysisRecord, JobCategory } from "./HistoryMockData";
import HistoryTable from "./HistoryTable";
import SearchBar from "./SearchBar";
import Pagination from "./Pagination";

type ScoreFilter = "all" | "optimal" | "promising" | "gap";

export default function HistoryPageClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | "all">("all");
  const [selectedScore, setSelectedScore] = useState<ScoreFilter>("all");
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Filter logic
  const filteredRecords = useMemo(() => {
    return MOCK_HISTORY.filter((item) => {
      // Text search matching position, company, or date
      const query = searchQuery.trim().toLowerCase();
      const matchesText =
        !query ||
        item.position.toLowerCase().includes(query) ||
        item.company.toLowerCase().includes(query) ||
        item.date.includes(query);

      // Category filter
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      // Score filter
      let matchesScore = true;
      if (selectedScore === "optimal") {
        matchesScore = item.matchScore >= 80;
      } else if (selectedScore === "promising") {
        matchesScore = item.matchScore >= 50 && item.matchScore < 80;
      } else if (selectedScore === "gap") {
        matchesScore = item.matchScore < 50;
      }

      return matchesText && matchesCategory && matchesScore;
    });
  }, [searchQuery, selectedCategory, selectedScore]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRecords = useMemo(() => {
    const start = (validCurrentPage - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, validCurrentPage]);

  // Handlers
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedScore("all");
    setCurrentPage(1);
  };

  const isFiltered =
    searchQuery.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedScore !== "all";

  return (
    <main className="min-h-screen bg-bg text-text antialiased py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          {/* Left: Badge + Heading + Subtitle */}
          <div>
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fff4eb] text-[#c25e1a] border border-[#fed7aa] mb-2.5 shadow-2xs">
              <svg
                className="w-3.5 h-3.5 text-[#ea580c]"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Kho lưu trữ đánh giá CV thông minh</span>
            </div>

            {/* Page Heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-text tracking-tight">
              Lịch sử phân tích
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm md:text-base text-muted max-w-2xl mt-1.5 leading-relaxed">
              Xem lại các lần phân tích CV trước đây của bạn, theo dõi mức độ đáp ứng
              năng lực và cải thiện hồ sơ ứng tuyển theo thời gian.
            </p>
          </div>

          {/* Right: Search Bar & Filter Toggle */}
          <div className="w-full lg:w-auto">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              onClear={() => handleSearchChange("")}
              isFilterActive={showFilterPanel || isFiltered}
              onToggleFilter={() => setShowFilterPanel((prev) => !prev)}
            />
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {showFilterPanel && (
          <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-xs transition-all duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border/70 mb-4">
              <h3 className="text-xs sm:text-sm font-bold text-text flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                  />
                </svg>
                Bộ lọc nâng cao
              </h3>
              {isFiltered && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Xóa tất cả lọc
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-2">
                  Lĩnh vực công việc:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { key: "all", label: "Tất cả" },
                      { key: "frontend", label: "Frontend" },
                      { key: "mobile", label: "Mobile" },
                      { key: "design", label: "UI/UX" },
                      { key: "backend", label: "Backend" },
                      { key: "fullstack", label: "Fullstack" },
                      { key: "devops", label: "DevOps" },
                      { key: "data", label: "Data" },
                      { key: "ai", label: "AI/ML" },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.key);
                        setCurrentPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        selectedCategory === cat.key
                          ? "bg-primary text-on-primary font-semibold"
                          : "bg-surface-2 text-muted hover:text-text hover:bg-border/60"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Score Filter */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-2">
                  Mức độ phù hợp:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { key: "all", label: "Tất cả điểm" },
                      { key: "optimal", label: "≥ 80% Tối ưu" },
                      { key: "promising", label: "50–79% Khả quan" },
                      { key: "gap", label: "< 50% Cần nâng cấp" },
                    ] as const
                  ).map((sc) => (
                    <button
                      key={sc.key}
                      type="button"
                      onClick={() => {
                        setSelectedScore(sc.key);
                        setCurrentPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        selectedScore === sc.key
                          ? "bg-primary text-on-primary font-semibold"
                          : "bg-surface-2 text-muted hover:text-text hover:bg-border/60"
                      }`}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-surface rounded-2xl md:rounded-[24px] border border-border shadow-xs p-4 sm:p-6 lg:p-8">
          {filteredRecords.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-2 flex items-center justify-center text-muted">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-bold text-text">
                Không tìm thấy lượt phân tích nào
              </h3>
              <p className="text-xs sm:text-sm text-muted mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `Không có kết quả nào khớp với từ khóa "${searchQuery}". Vui lòng thử từ khóa khác.`
                  : "Chưa có lượt đánh giá nào phù hợp với bộ lọc hiện tại."}
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            /* Table & Pagination */
            <div className="space-y-6">
              <HistoryTable
                records={paginatedRecords}
                totalCount={filteredRecords.length}
              />
              <Pagination
                currentPage={validCurrentPage}
                totalPages={totalPages}
                totalRecords={filteredRecords.length}
                pageSize={PAGE_SIZE}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
