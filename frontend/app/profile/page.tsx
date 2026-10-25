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

  // Gom hàm fetchProfile thành useCallback để tái sử dụng gọi lại khi cần refresh
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL!}/api/me/detail/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

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
  }, []);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 text-gray-500">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Đang tải thông tin hồ sơ...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 bg-red-50 border border-red-200 rounded-lg text-center text-red-600">
        <p className="font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 relative">
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