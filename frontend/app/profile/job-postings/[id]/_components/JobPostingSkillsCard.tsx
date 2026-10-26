import React, { useState } from "react";
import JobPostingSkillModal from "./JobPostingSkillModal";
import { getLevelBadgeConfig } from "@/app/profile/_types";

interface JobPostingSkillsCardProps {
    jobId: number | string;
    skills: any[];
    onJobUpdate: () => void; // Callback để load lại chi tiết Job sau khi thêm/sửa/xóa
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function JobPostingSkillsCard({ jobId, skills, onJobUpdate }: JobPostingSkillsCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState<any | null>(null);
    const [deletingId, setDeletingId] = useState<number | string | null>(null);

    const handleOpenAdd = () => {
        setEditingSkill(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: any) => {
        setEditingSkill(item);
        setIsModalOpen(true);
    };

    const handleDeleteSkill = async (skillId: number | string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!confirm("Bạn có chắc chắn muốn xóa kỹ năng yêu cầu này không?")) {
            return;
        }

        setDeletingId(skillId);
        try {
            const res = await fetch(`${API_URL}/api/me/job-postings/${jobId}/skills/${skillId}/`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Không thể xóa kỹ năng này. Vui lòng thử lại.");
            }

            onJobUpdate();
        } catch (err: any) {
            alert(err.message || "Lỗi kết nối tới máy chủ.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="border border-border rounded-lg p-5 bg-surface shadow-sm mt-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-text">Kỹ năng yêu cầu cho vị trí này</h2>
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
                    <p className="text-sm text-muted font-medium">Chưa có kỹ năng yêu cầu nào được phân tích hoặc thêm mới!</p>
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
                            const isDeleting = deletingId === item.id;

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => handleOpenEdit(item)}
                                    className="p-3 rounded-md border border-border bg-surface-2 flex items-center justify-between gap-3 cursor-pointer hover:border-primary transition group relative"
                                >
                                    <div>
                                        <span className="font-medium text-sm text-text truncate group-hover:text-primary block">
                                            {item.skill_name || "Kỹ năng"}
                                        </span>
                                        {item.reasoning && (
                                            <p className="text-xs text-muted line-clamp-1 mt-0.5">{item.reasoning}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-0.5 text-xs font-medium border rounded-full whitespace-nowrap ${badge.className}`}>
                                            {badge.label}
                                        </span>

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

            <JobPostingSkillModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={onJobUpdate}
                jobId={jobId}
                editingSkill={editingSkill}
            />
        </div>
    );
}