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

import { useState } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { StudentProfile } from "../_types";

interface ProfileSummaryCardProps {
  studentProfile: StudentProfile | null;
  onOpenUploadModal: () => void;
  onProfileUpdate?: (updatedProfile: Partial<StudentProfile>) => void;
}

export default function ProfileSummaryCard({
  studentProfile,
  onOpenUploadModal,
  onProfileUpdate,
}: ProfileSummaryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [summary, setSummary] = useState(studentProfile?.profile_summary || "");
  const [occupationsStr, setOccupationsStr] = useState(
    studentProfile?.extracted_occupations?.join(", ") || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Khi bấm nút sửa, đồng bộ lại dữ liệu mới nhất từ props vào state
  const handleStartEdit = () => {
    if (studentProfile) {
      setSummary(studentProfile.profile_summary || "");
      setOccupationsStr(studentProfile.extracted_occupations?.join(", ") || "");
    }
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Chuyển chuỗi các vị trí cách nhau bằng dấu phẩy thành mảng
      const occupationsArray = occupationsStr
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL!}/api/me/student-profile/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          profile_summary: summary,
          extracted_occupations: occupationsArray,
        }),
      });

      if (!res.ok) {
        throw new Error("Không thể cập nhật hồ sơ. Vui lòng thử lại.");
      }

      const updatedData: any = await res.json();

      // Cập nhật trực tiếp state nội bộ từ kết quả trả về của API
      setSummary(updatedData.profile_summary);
      setOccupationsStr(updatedData.extracted_occupations.join(", "));

      // Gọi callback báo cho component cha cập nhật lại
      if (onProfileUpdate) {
        onProfileUpdate(updatedData);
      }

      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi lưu.");
    } finally {
      setLoading(false);
    }
  };

  if (!studentProfile) {
    return (
      <div className="p-8 border border-dashed border-primary bg-primary-soft rounded-lg text-center shadow-sm">
        <h3 className="text-lg font-semibold text-text">Chào bạn! Hãy cập nhật CV của mình nhé 🚀</h3>
        <p className="mt-1 text-sm text-muted max-w-md mx-auto">
          Tải lên CV giúp hệ thống tự động phân tích kinh nghiệm và đề xuất cơ hội nghề nghiệp phù hợp nhất dành cho bạn.
        </p>
        <div className="mt-5">
          <button
            onClick={onOpenUploadModal}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-on-primary bg-primary hover:opacity-90 rounded-md shadow-sm transition"
          >
            Tải CV lên ngay để AI phân tích
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KHU VỰC TÓM TẮT & ĐỊNH HƯỚNG */}
      <div className="border border-border rounded-lg p-5 bg-surface shadow-sm relative">

        {/* Header card kèm nút chỉnh sửa */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-text">Tóm tắt bản thân & Định hướng</h2>
          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="inline-flex items-center space-x-1 text-xs font-medium text-primary hover:opacity-80 bg-primary-soft px-2.5 py-1 rounded-sm border border-border transition"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Chỉnh sửa</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="inline-flex items-center space-x-1 text-xs font-medium text-muted hover:bg-surface-2 px-2.5 py-1 rounded-sm border border-border transition"
              >
                <X className="w-3.5 h-3.5" />
                <span>Hủy</span>
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center space-x-1 text-xs font-medium text-on-primary bg-primary hover:opacity-90 px-3 py-1 rounded-sm shadow-sm transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Lưu</span>
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-sm text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Nội dung Tóm tắt */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-muted mb-1">
            Profile Summary
          </label>
          {isEditing ? (
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              className="w-full text-sm p-3 rounded-sm border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ) : (
            <p className="text-sm text-muted leading-relaxed bg-surface-2 p-4 rounded-sm border border-border">
              {studentProfile.profile_summary || "Chưa có tóm tắt hồ sơ."}
            </p>
          )}
        </div>

        {/* Nội dung Vị trí định hướng */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1">
            Định hướng vị trí phù hợp (cách nhau bằng dấu phẩy)
          </label>
          {isEditing ? (
            <input
              type="text"
              value={occupationsStr}
              onChange={(e) => setOccupationsStr(e.target.value)}
              placeholder="Software Engineer, Backend Developer,..."
              className="w-full text-sm p-2.5 rounded-sm border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {studentProfile.extracted_occupations && studentProfile.extracted_occupations.length > 0 ? (
                studentProfile.extracted_occupations.map((occupation, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-soft text-primary text-xs font-medium rounded-full border border-border"
                  >
                    {occupation}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted italic">Chưa có vị trí định hướng nào.</span>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}