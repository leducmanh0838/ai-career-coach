import React, { useState } from "react";
import { getLevelBadgeConfig, StudentSkill } from "../_types";
import SkillModal from "./SkillModal";

interface ProfileSkillsCardProps {
  skills: StudentSkill[];
  onProfileUpdate: () => void; // Callback để gọi lại API get detail profile sau khi thêm/sửa/xóa thành công
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function ProfileSkillsCard({ skills, onProfileUpdate }: ProfileSkillsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<StudentSkill | null>(null);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  const handleOpenAdd = () => {
    setEditingSkill(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: StudentSkill) => {
    setEditingSkill(item);
    setIsModalOpen(true);
  };

  // Hàm xử lý xóa kỹ năng
  const handleDeleteSkill = async (id: number | string, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra thẻ div bọc ngoài (tránh việc vừa mở modal sửa vừa gọi xóa)

    if (!confirm("Bạn có chắc chắn muốn xóa kỹ năng này khỏi hồ sơ không?")) {
      return;
    }

    setDeletingId(id);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/api/me/skills/${id}/`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Không thể xóa kỹ năng này. Vui lòng thử lại.");
      }

      // Gọi callback để làm mới lại dữ liệu hồ sơ ngoài trang Profile
      onProfileUpdate();
    } catch (err: any) {
      alert(err.message || "Lỗi kết nối tới máy chủ.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="border border-border rounded-lg p-5 bg-surface shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-text">Kỹ năng (Skills)</h2>
          {skills && skills.length > 0 && (
            <span className="text-xs bg-surface-2 text-muted font-medium px-2.5 py-0.5 rounded-full">
              {skills.length}
            </span>
          )}
        </div>
        <button
          onClick={handleOpenAdd}
          className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
        >
          + Thêm kỹ năng
        </button>
      </div>

      {!skills || skills.length === 0 ? (
        <div className="text-center py-6 px-4 border border-dashed border-border bg-surface-2 rounded-md">
          <p className="text-sm text-muted font-medium">Bạn chưa có kỹ năng nào được ghi nhận trong hồ sơ!</p>
          <button
            onClick={handleOpenAdd}
            className="mt-3 inline-flex items-center px-3 py-1.5 text-xs font-medium text-on-primary bg-primary hover:opacity-90 rounded-md transition"
          >
            + Thêm kỹ năng ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...skills]
            .sort((a, b) => Number(a.id) - Number(b.id))
            .map((item) => {
              const badge = getLevelBadgeConfig(item.level);
              const skillDisplayName = item.skill?.name_vi && item.skill.name_vi.trim() !== ""
                ? `${item.skill.name_vi} (${item.skill.name})`
                : item.skill?.name || "Kỹ năng";

              const isDeleting = deletingId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenEdit(item)} // Click vào thẻ để mở modal chỉnh sửa level
                  className="p-3 rounded-md border border-border bg-surface-2 flex items-center justify-between gap-3 cursor-pointer hover:border-primary transition group relative"
                >
                  <span className="font-medium text-sm text-text truncate group-hover:text-primary">
                    {skillDisplayName}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 text-xs font-medium border rounded-full whitespace-nowrap ${badge.className}`}>
                      {badge.label}
                    </span>

                    {/* Nút xóa nhanh hiển thị khi hover vào thẻ kỹ năng */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSkill(item.id, e)}
                      disabled={isDeleting}
                      title="Xóa kỹ năng"
                      className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-600 p-1 rounded-sm transition disabled:opacity-50"
                    >
                      {isDeleting ? "..." : "✕"}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Modal dùng chung cho cả Thêm và Sửa */}
      <SkillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onProfileUpdate}
        editingSkill={editingSkill}
      />
    </div>
  );
}