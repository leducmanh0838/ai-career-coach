"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCV } from "@/context/CVContext";
import { UserProfile } from "./_types";
import ProfileSidebar from "./_components/ProfileSidebar";
import ProfileSummaryCard from "./_components/ProfileSummaryCard";
import ProfileSkillsCard from "./_components/ProfileSkillsCard";
import UploadCVModal from "./_components/UploadCVModal";

export default function ProfilePage() {
  const router = useRouter();
  const { setSelectedFile } = useCV();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [tempFile, setTempFile] = useState<File | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL!}/api/me/detail/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      // Nếu lỗi xác thực (401 Unauthorized hoặc 403 Forbidden), chuyển hướng ngay về /login
      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Không thể tải thông tin hồ sơ. Vui lòng đăng nhập lại.");
      }

      const data: UserProfile = await res.json();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi kết nối dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProceedToAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempFile) return;

    setSelectedFile(tempFile);
    router.push("/profile/analyze");
  };

  if (loading) {
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

  return (
    <div className="min-h-screen bg-bg text-text relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* CỘT TRÁI: SIDEBAR */}
          <ProfileSidebar
            profile={profile}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
          />

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT & KỸ NĂNG */}
          <div className="flex-1 space-y-6">
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

            {/* TRUYỀN HÀM fetchProfile VÀO onProfileUpdate CỦA KỸ NĂNG */}
            <ProfileSkillsCard
              skills={profile.student_profile?.student_skills || []}
              onProfileUpdate={fetchProfile} 
            />
          </div>

        </div>
      </div>

      {/* MODAL TẢI CV */}
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