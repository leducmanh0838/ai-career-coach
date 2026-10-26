import React, { useState, useEffect, memo } from "react";
import { StudentSkill } from "../_types";

interface SkillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    editingSkill?: any | null; // Có thể nhận StudentSkill hoặc item từ AI phân tích
}

const AVAILABLE_LEVELS = [
    { value: "Foundation", label: "Nền tảng (Foundation)" },
    { value: "Applied", label: "Ứng dụng (Applied)" },
    { value: "Proficient", label: "Thành thạo (Proficient)" },
    { value: "Advanced", label: "Nâng cao / Chuyên gia (Advanced)" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function SkillModal({
    isOpen,
    onClose,
    onSuccess,
    editingSkill = null,
}: SkillModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedSkill, setSelectedSkill] = useState<any | null>(null);
    const [level, setLevel] = useState("Foundation");
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (editingSkill) {
            setSelectedSkill(editingSkill.skill || { id: editingSkill.skill_id, name: editingSkill.skill_name });
            setLevel(editingSkill.level || "Foundation");
        } else {
            setSearchQuery("");
            setSearchResults([]);
            setSelectedSkill(null);
            setLevel("Foundation");
        }
        setError("");
    }, [editingSkill, isOpen]);

    useEffect(() => {
        if (editingSkill || !searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setSearching(true);
            try {
                const token = localStorage.getItem("access_token");
                const res = await fetch(
                    `${API_URL}/api/skills/?q=${encodeURIComponent(searchQuery)}`,
                    {
                        headers: {
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        credentials: "include",
                    }
                );

                if (res.ok) {
                    const data: any = await res.json();
                    const resultsArray = Array.isArray(data) ? data : data.results || [];
                    setSearchResults(resultsArray);
                } else {
                    setSearchResults([]);
                }
            } catch (err) {
                console.error("Lỗi tìm kiếm kỹ năng:", err);
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, editingSkill]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const targetSkill = selectedSkill || editingSkill?.skill || (editingSkill?.skill_id ? { id: editingSkill.skill_id } : null);

        if (!targetSkill) {
            setError("Vui lòng chọn một kỹ năng từ danh sách gợi ý.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Nếu editingSkill có id (StudentSkill id), ta dùng PATCH để cập nhật. Nếu không, dùng POST để thêm mới.
            const hasId = editingSkill && editingSkill.id;
            const url = hasId
                ? `${API_URL}/api/me/skills/${editingSkill.id}/`
                : `${API_URL}/api/me/skills/`;

            const method = hasId ? "PATCH" : "POST";
            const skillId = targetSkill.id || targetSkill.skill_id;

            const payload = hasId
                ? { level }
                : { skill: skillId, skill_id: skillId, level };

            const token = localStorage.getItem("access_token");
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData: any = await res.json();
                const errorMsg = typeof errData === 'object'
                    ? Object.entries(errData)
                        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                        .join(' | ')
                    : "Có lỗi xảy ra khi lưu kỹ năng.";
                throw new Error(errorMsg);
            }

            if (typeof onSuccess === "function") {
                onSuccess();
            }
            onClose();
        } catch (err: any) {
            setError(err.message || "Lỗi kết nối tới máy chủ.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-surface rounded-lg shadow-xl max-w-md w-full p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text">
                        {editingSkill?.id ? "Chỉnh sửa mức độ kỹ năng" : "Thêm kỹ năng mới"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-text text-sm font-bold"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!editingSkill?.id ? (
                        <div className="relative">
                            <label className="block text-xs font-medium text-muted mb-1">
                                Tìm kiếm kỹ năng trong hệ thống
                            </label>
                            {selectedSkill ? (
                                <div className="flex items-center justify-between p-2.5 bg-primary-soft border border-border rounded-sm">
                                    <span className="text-sm font-medium text-primary">
                                        {selectedSkill.name_vi
                                            ? `${selectedSkill.name_vi} (${selectedSkill.name})`
                                            : selectedSkill.name || selectedSkill.skill_name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSkill(null)}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Đổi kỹ năng
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Nhập tên kỹ năng (ví dụ: Python, React...)"
                                        className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    {searching && (
                                        <p className="text-xs text-muted mt-1">Đang tìm kiếm...</p>
                                    )}

                                    {searchResults.length > 0 && (
                                        <ul className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-surface border border-border rounded-sm shadow-lg">
                                            {searchResults.map((skill) => (
                                                <li
                                                    key={skill.id}
                                                    onClick={() => {
                                                        setSelectedSkill(skill);
                                                        setSearchResults([]);
                                                        setSearchQuery("");
                                                    }}
                                                    className="px-3 py-2 text-sm hover:bg-surface-2 cursor-pointer text-text border-b border-border last:border-none"
                                                >
                                                    <div className="font-medium">
                                                        {skill.name_vi || skill.name}
                                                    </div>
                                                    {skill.name_vi && (
                                                        <div className="text-xs text-muted">
                                                            {skill.name}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div>
                            <label className="block text-xs font-medium text-muted mb-1">
                                Kỹ năng
                            </label>
                            <div className="p-2.5 bg-surface-2 border border-border rounded-sm text-sm font-medium text-text">
                                {selectedSkill?.name_vi
                                    ? `${selectedSkill.name_vi} (${selectedSkill.name})`
                                    : selectedSkill?.name || editingSkill?.skill_name || "Kỹ năng"}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-muted mb-1">
                            Mức độ thành thạo (Level)
                        </label>
                        <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {AVAILABLE_LEVELS.map((lvl) => (
                                <option key={lvl.value} value={lvl.value}>
                                    {lvl.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium text-muted bg-surface-2 hover:opacity-80 rounded-sm transition border border-border"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (!editingSkill?.id && !selectedSkill)}
                            className="px-4 py-2 text-xs font-medium text-on-primary bg-primary hover:opacity-90 disabled:opacity-50 rounded-sm transition shadow-sm"
                        >
                            {loading ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default memo(SkillModal);