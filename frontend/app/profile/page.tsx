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

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Import useAuth từ context của bạn
import { useCV } from "@/context/CVContext";
import { UserProfile } from "./_types";
import ProfileSidebar from "./_components/ProfileSidebar";
import ProfileSummaryCard from "./_components/ProfileSummaryCard";
import ProfileSkillsCard from "./_components/ProfileSkillsCard";
import UploadCVModal from "./_components/UploadCVModal";
import RecruiterJobManager from "./_components/RecruiterJobManager"; // Component quản lý job của recruiter

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth(); // Lấy thông tin user và trạng thái load từ AuthContext
  const { setSelectedFile } = useCV();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [tempFile, setTempFile] = useState<File | null>(null);

  const fetchProfile = useCallback(async () => {
    // Nếu chưa có thông tin user sau khi AuthProvider đã load xong thì chuyển hướng về login
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      // Xác định endpoint dựa vào role của user từ AuthContext
      const endpoint = user.role === "recruiter" ? "/api/me/recruiter/" : "/api/me/student/";
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Gửi kèm cookie xác thực
      });

      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.");
      }

      const data: UserProfile = await res.json();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi kết nối dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  useEffect(() => {
    // Chỉ gọi API khi AuthProvider đã xác thực xong (isLoading === false)
    if (!isAuthLoading) {
      fetchProfile();
    }
  }, [isAuthLoading, fetchProfile]);

  const handleProceedToAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempFile) return;

    setSelectedFile(tempFile);
    router.push("/profile/analyze");
  };

  // Hiển thị trạng thái đang tải chung (của cả Auth và Profile)
  if (isAuthLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-muted">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Đang tải thông tin hồ sơ...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 bg-surface border border-border rounded-lg text-center shadow-sm">
        <p className="font-medium text-red-600">{error}</p>
        <div className="mt-4 flex justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-surface-2 text-muted text-sm font-medium rounded-sm hover:opacity-80 transition"
          >
            Thử lại
          </button>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-primary text-on-primary text-sm font-medium rounded-sm hover:opacity-90 transition"
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // Kiểm tra role trực tiếp từ user trong AuthContext hoặc profile trả về từ API
  const isRecruiter = user?.role === "recruiter";

  return (
    <div className="min-h-screen bg-bg text-text relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* CỘT TRÁI: SIDEBAR */}
          <ProfileSidebar
            profile={profile}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
          />

          {/* CỘT PHẢI: PHÂN TÁCH GIAO DIỆN THEO VAI TRÒ */}
          <div className="flex-1 space-y-6">
            {isRecruiter ? (
              /* GIAO DIỆN NHÀ TUYỂN DỤNG: Quản lý danh sách Job Posting */
              <RecruiterJobManager
                initialJobs={(profile as any).job_postings || []}
                onJobsChange={fetchProfile}
              />
            ) : (
              /* GIAO DIỆN SINH VIÊN: Giữ nguyên các component cũ */
              <>
                <ProfileSummaryCard
                  studentProfile={profile.student_profile}
                  onOpenUploadModal={() => setIsUploadModalOpen(true)}
                  onProfileUpdate={(updatedData) => {
                    setProfile((prev) => {
                      if (!prev || !prev.student_profile) return prev;
                      return {
                        ...prev,
                        student_profile: {
                          ...prev.student_profile,
                          ...updatedData,
                        },
                      };
                    });
                  }}
                />

                <ProfileSkillsCard
                  skills={profile.student_profile?.student_skills || []}
                  onProfileUpdate={fetchProfile}
                />
              </>
            )}
          </div>

        </div>
      </div>

      {/* MODAL TẢI CV (Chỉ dành cho sinh viên) */}
      <UploadCVModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        tempFile={tempFile}
        setTempFile={setTempFile}
        onSubmit={handleProceedToAnalyze}
      />
    </div>
  );
}