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
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {editingSkill?.id ? "Chỉnh sửa mức độ kỹ năng" : "Thêm kỹ năng mới"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!editingSkill?.id ? (
                        <div className="relative">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tìm kiếm kỹ năng trong hệ thống
                            </label>
                            {selectedSkill ? (
                                <div className="flex items-center justify-between p-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                                    <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                                        {selectedSkill.name_vi
                                            ? `${selectedSkill.name_vi} (${selectedSkill.name})`
                                            : selectedSkill.name || selectedSkill.skill_name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSkill(null)}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
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
                                        className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {searching && (
                                        <p className="text-xs text-gray-400 mt-1">Đang tìm kiếm...</p>
                                    )}

                                    {searchResults.length > 0 && (
                                        <ul className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg">
                                            {searchResults.map((skill) => (
                                                <li
                                                    key={skill.id}
                                                    onClick={() => {
                                                        setSelectedSkill(skill);
                                                        setSearchResults([]);
                                                        setSearchQuery("");
                                                    }}
                                                    className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-zinc-700/50 last:border-none"
                                                >
                                                    <div className="font-medium">
                                                        {skill.name_vi || skill.name}
                                                    </div>
                                                    {skill.name_vi && (
                                                        <div className="text-xs text-gray-400">
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
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Kỹ năng
                            </label>
                            <div className="p-2.5 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md text-sm font-medium text-gray-800 dark:text-gray-200">
                                {selectedSkill?.name_vi
                                    ? `${selectedSkill.name_vi} (${selectedSkill.name})`
                                    : selectedSkill?.name || editingSkill?.skill_name || "Kỹ năng"}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Mức độ thành thạo (Level)
                        </label>
                        <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-md transition"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (!editingSkill?.id && !selectedSkill)}
                            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md transition"
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