"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import "@/components/styles/tiptap.css";

interface JobRequiredSkill {
  id: number;
  skill: number | null;
  skill_name: string;
  level: string | null;
  reasoning: string | null;
  evidence: any[];
}

interface JobPostingDetail {
  id: number;
  title: string;
  description: string;
  status: "draft" | "published" | "closed";
  required_skills: JobRequiredSkill[];
  created_at: string;
  updated_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function JobPostingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const [job, setJob] = useState<JobPostingDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Hàm fetch chi tiết tin tuyển dụng (có tham số showLoading để tránh bị giật cuộn trang)
  const fetchJobDetail = useCallback(async (showLoading = false) => {
    if (!jobId) return;

    try {
      if (showLoading) setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/api/job-postings/${jobId}/`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Không tìm thấy tin tuyển dụng này.");
        }
        throw new Error("Không thể tải thông tin tin tuyển dụng.");
      }

      const data: JobPostingDetail = await res.json();
      setJob(data);
    } catch (err: any) {
      console.error("Lỗi khi tải dữ liệu job detail:", err);
      setError(err.message || "Đã xảy ra lỗi kết nối.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJobDetail(true); // Lần đầu tiên load trang thì bật trạng thái loading
  }, [fetchJobDetail]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-muted">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-2 rounded w-1/3 mx-auto"></div>
          <div className="h-32 bg-surface-2 rounded"></div>
        </div>
        <p className="mt-4">Đang tải chi tiết tin tuyển dụng...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="p-6 border border-red-200 bg-red-50 text-red-700 rounded-lg mb-4">
          {error || "Tin tuyển dụng không tồn tại."}
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-primary text-on-primary rounded-md text-sm font-medium hover:opacity-90 transition"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Nút quay lại & Nút chuyển sang trang phân tích AI */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-sm font-medium text-muted hover:text-text transition flex items-center gap-1"
        >
          ← Quay lại danh sách
        </button>
      </div>

      {/* Thông tin chính của tin tuyển dụng */}
      <div className="bg-surface border border-border rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-text">{job.title}</h1>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  job.status === "published"
                    ? "bg-green-100 text-green-700"
                    : job.status === "draft"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {job.status === "published"
                  ? "Đang tuyển"
                  : job.status === "draft"
                  ? "Bản nháp"
                  : "Đã đóng"}
              </span>
            </div>
            <p className="text-xs text-muted mt-1">
              Ngày tạo: {new Date(job.created_at).toLocaleDateString("vi-VN")} | Cập nhật lần cuối: {new Date(job.updated_at).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>

        {/* Nội dung Mô tả chi tiết (render HTML từ TipTap Editor) */}
        <div>
          <h2 className="text-sm font-semibold text-muted mb-2 uppercase tracking-wider">
            Mô tả công việc & Yêu cầu
          </h2>
          <div
            className="tiptap bg-surface-2/50 border border-border rounded-md p-4 text-text max-w-none"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </div>
      </div>
    </div>
  );
}