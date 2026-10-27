"use client";

import { useState } from "react";
import SkillModal from "../skill/SkillModal";

interface JobRequiredSkill {
    id: number;
    skill: number | string | null;
    skill_name: string;
    level: string | null;
    reasoning: string | null;
    evidence: any[];
}

interface JobPostingDetail {
    id: number;
    title: string;
    required_skills: JobRequiredSkill[];
    [key: string]: any;
}

interface StudentSkill {
    id: number;
    skill: {
        id: string | number;
        name: string;
        name_vi?: string;
    };
    level: string | null;
}

interface StudentProfile {
    id: number;
    profile_summary: string;
    extracted_occupations: string[];
    student_skills: StudentSkill[];
}

interface StudentUser {
    id: number;
    username: string;
    student_profile: StudentProfile;
}

interface JobMatchSectionProps {
    job: JobPostingDetail;
    apiUrl: string;
}

// Định nghĩa thứ tự các cấp độ năng lực để so sánh
const LEVEL_RANK: Record<string, number> = {
    "Foundation": 1,
    "Applied": 2,
    "Proficient": 3,
    "Advanced": 4,
};

export default function JobMatchSection({ job, apiUrl }: JobMatchSectionProps) {
    const [analyzing, setAnalyzing] = useState(false);
    const [matchResult, setMatchResult] = useState<any>(null);
    const [error, setError] = useState<string>("");

    // State điều khiển SkillModal tái sử dụng
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMissingSkill, setSelectedMissingSkill] = useState<any | null>(null);

    const handleAnalyzeMatch = async () => {
        try {
            setAnalyzing(true);
            setError("");

            const res = await fetch(`${apiUrl}/api/me/student`, {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Không thể tải thông tin hồ sơ sinh viên.");
            }

            const student: StudentUser = await res.json();

            // 1. Lọc required_skills của nhà tuyển dụng: BỎ QUA nếu level === null
            const validJobSkills = job.required_skills.filter(
                (reqSkill) => reqSkill.level !== null
            );

            // 2. Map kỹ năng của sinh viên theo tên và theo ID
            const studentSkillsMap = new Map();
            const studentSkillsByIdMap = new Map();

            student.student_profile.student_skills.forEach((s) => {
                if (s.skill && s.skill.name) {
                    studentSkillsMap.set(s.skill.name.toLowerCase(), s);
                }
                if (s.skill && s.skill.id) {
                    studentSkillsByIdMap.set(String(s.skill.id), s);
                }
            });

            const matchedSkills: any[] = [];
            const missingSkills: any[] = [];          // Hoàn toàn chưa có trong CV -> Thêm mới (POST)
            const unspecifiedLevelSkills: any[] = []; // Đã có trong CV nhưng level là null/undefined -> Cập nhật (PATCH)
            const upgradeNeededSkills: any[] = [];    // Đã có level nhưng thấp hơn yêu cầu JD -> Nâng cấp (PATCH)

            validJobSkills.forEach((reqSkill) => {
                let foundStudentSkill: StudentSkill | null = null;

                // 1. Ưu tiên so khớp chính xác bằng ID/URL của kỹ năng
                if (reqSkill.skill && studentSkillsByIdMap.has(String(reqSkill.skill))) {
                    foundStudentSkill = studentSkillsByIdMap.get(String(reqSkill.skill));
                } else {
                    // 2. Fallback: So khớp tương đối theo tên
                    const skillNameLower = reqSkill.skill_name.toLowerCase().trim();
                    for (const [sName, sObj] of studentSkillsMap.entries()) {
                        if (sName === skillNameLower || sName.includes(skillNameLower) || skillNameLower.includes(sName)) {
                            foundStudentSkill = sObj;
                            break;
                        }
                    }
                }

                const requiredLevelRank = LEVEL_RANK[reqSkill.level || "Foundation"] || 1;

                // TRƯỜNG HỢP 1: Hoàn toàn chưa có kỹ năng trong CV
                if (!foundStudentSkill) {
                    missingSkills.push(reqSkill);
                } 
                // TRƯỜNG HỢP 2: Đã có kỹ năng trong CV nhưng trường level đang là null hoặc undefined
                else if (!foundStudentSkill.level) {
                    unspecifiedLevelSkills.push({
                        ...reqSkill,
                        student_level: null,
                        student_skill_obj: foundStudentSkill,
                    });
                } 
                // TRƯỜNG HỢP 3: Đã có kỹ năng và có sẵn level cụ thể
                else {
                    const studentLevelRank = LEVEL_RANK[foundStudentSkill.level] || 1;

                    if (requiredLevelRank > studentLevelRank) {
                        upgradeNeededSkills.push({
                            ...reqSkill,
                            student_level: foundStudentSkill.level,
                            student_skill_obj: foundStudentSkill,
                        });
                    } else {
                        matchedSkills.push({
                            ...reqSkill,
                            student_level: foundStudentSkill.level,
                        });
                    }
                }
            });

            const totalCheckable = validJobSkills.length;
            const totalSatisfied = matchedSkills.length;

            const matchScore =
                totalCheckable > 0
                    ? Math.round((totalSatisfied / totalCheckable) * 100)
                    : 0;

            setMatchResult({
                totalValidSkills: totalCheckable,
                skippedSkillsCount: job.required_skills.length - totalCheckable,
                matchedSkills,
                missingSkills,
                unspecifiedLevelSkills,
                upgradeNeededSkills,
                matchScore,
            });
        } catch (err: any) {
            console.error("Lỗi phân tích độ phù hợp:", err);
            setError(err.message || "Đã xảy ra lỗi khi phân tích.");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                    <h2 className="text-lg font-bold text-text">AI Career Coach - Phân tích độ phù hợp</h2>
                    <p className="text-xs text-muted mt-1">
                        Hệ thống tự động đối chiếu khoảng cách năng lực, so sánh cấp độ và gợi ý lộ trình cải thiện.
                    </p>
                </div>
                <button
                    onClick={handleAnalyzeMatch}
                    disabled={analyzing}
                    className="px-4 py-2 bg-primary text-on-primary rounded-md text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                >
                    {analyzing ? "Đang phân tích..." : "✨ Kiểm tra độ phù hợp"}
                </button>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
                    {error}
                </div>
            )}

            {matchResult && (
                <div className="space-y-4 pt-2">
                    {/* Điểm số phù hợp */}
                    <div className="flex items-center justify-between bg-surface-2/60 p-4 rounded-lg border border-border">
                        <div>
                            <span className="text-sm font-semibold text-muted">Mức độ đáp ứng kỹ năng:</span>
                            <div className="text-2xl font-bold text-primary mt-1">
                                {matchResult.matchScore}%
                            </div>
                        </div>
                        <div className="text-right text-xs text-muted space-y-1">
                            <div>Kỹ năng xét duyệt (khác null): {matchResult.totalValidSkills}</div>
                            <div className="text-amber-600">Đã bỏ qua (level null từ JD): {matchResult.skippedSkillsCount}</div>
                        </div>
                    </div>

                    {/* Kỹ năng đã đáp ứng */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-green-700 flex items-center gap-1">
                            ✅ Kỹ năng đã đáp ứng ({matchResult.matchedSkills.length})
                        </h3>
                        {matchResult.matchedSkills.length === 0 ? (
                            <p className="text-xs text-muted italic">Chưa có kỹ năng nào đạt chuẩn yêu cầu.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {matchResult.matchedSkills.map((item: any) => (
                                    <div key={item.id} className="p-3 bg-green-50/50 border border-green-200 rounded-md text-xs space-y-1">
                                        <div className="font-semibold text-green-900">{item.skill_name}</div>
                                        <div className="text-muted">Yêu cầu JD: <span className="font-medium text-text">{item.level}</span> | Của bạn: <span className="font-medium text-green-700">{item.student_level}</span></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Khoảng cách năng lực 1: Hoàn toàn thiếu trong CV */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-orange-700 flex items-center gap-1">
                            ⚠️ Kỹ năng chưa ghi nhận trong CV ({matchResult.missingSkills.length})
                        </h3>
                        {matchResult.missingSkills.length === 0 ? (
                            <p className="text-xs text-muted italic">Không có kỹ năng nào bị thiếu hoàn toàn.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {matchResult.missingSkills.map((item: any) => (
                                    <div key={item.id} className="p-3 bg-orange-50/50 border border-orange-200 rounded-md text-xs flex flex-col justify-between space-y-2">
                                        <div>
                                            <div className="font-semibold text-orange-900">{item.skill_name}</div>
                                            <div className="text-muted mt-0.5">Mức yêu cầu: <span className="font-medium text-text">{item.level}</span></div>
                                            <div className="text-[11px] text-amber-700 italic mt-1">💡 Hệ thống chưa tìm thấy trong hồ sơ. Bạn đã có kỹ năng này chưa?</div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedMissingSkill({
                                                    skill_id: item.skill,
                                                    skill_name: item.skill_name,
                                                    level: item.level || "Foundation"
                                                });
                                                setIsModalOpen(true);
                                            }}
                                            className="self-start px-2.5 py-1 bg-orange-600 text-white rounded text-[11px] font-medium hover:bg-orange-700 transition flex items-center gap-1"
                                        >
                                            ➕ Thêm mới vào hồ sơ
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Khoảng cách năng lực 2: Đã có trong CV nhưng level đang là null */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-blue-700 flex items-center gap-1">
                            📌 Kỹ năng đã có trong CV nhưng chưa rõ cấp độ ({matchResult.unspecifiedLevelSkills.length})
                        </h3>
                        {matchResult.unspecifiedLevelSkills.length === 0 ? (
                            <p className="text-xs text-muted italic">Tất cả kỹ năng trong CV đều đã được xác định cấp độ.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {matchResult.unspecifiedLevelSkills.map((item: any) => (
                                    <div key={item.id} className="p-3 bg-blue-50/50 border border-blue-200 rounded-md text-xs flex flex-col justify-between space-y-2">
                                        <div>
                                            <div className="font-semibold text-blue-900">{item.skill_name}</div>
                                            <div className="text-muted mt-0.5">Mức yêu cầu JD: <span className="font-bold text-text">{item.level}</span> | Của bạn: <span className="text-amber-600 font-medium">Chưa cập nhật cấp độ</span></div>
                                            <div className="text-[11px] text-blue-800 italic mt-1">✏️ Kỹ năng này đã có trong hồ sơ của bạn, hãy cập nhật mức độ thành thạo để hệ thống đánh giá chính xác.</div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedMissingSkill({
                                                    id: item.student_skill_obj.id, // Truyền ID để Modal tự động PATCH cập nhật
                                                    skill: item.student_skill_obj.skill,
                                                    skill_name: item.skill_name,
                                                    level: item.level || "Foundation"
                                                });
                                                setIsModalOpen(true);
                                            }}
                                            className="self-start px-2.5 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700 transition flex items-center gap-1"
                                        >
                                            🎯 Cập nhật cấp độ ngay
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Khoảng cách năng lực 3: Cần nâng cấp cấp độ (Level của JD > Level hiện tại của Sinh viên) */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-purple-700 flex items-center gap-1">
                            📈 Kỹ năng cần nâng cao cấp độ - Lộ trình học tập ({matchResult.upgradeNeededSkills.length})
                        </h3>
                        {matchResult.upgradeNeededSkills.length === 0 ? (
                            <p className="text-xs text-muted italic">Cấp độ các kỹ năng hiện tại của bạn đã đáp ứng hoặc vượt mức kỳ vọng.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {matchResult.upgradeNeededSkills.map((item: any) => (
                                    <div key={item.id} className="p-3 bg-purple-50/50 border border-purple-200 rounded-md text-xs flex flex-col justify-between space-y-2">
                                        <div>
                                            <div className="font-semibold text-purple-900">{item.skill_name}</div>
                                            <div className="text-muted mt-0.5">
                                                Mức yêu cầu JD: <span className="font-bold text-text">{item.level}</span> | Của bạn: <span className="font-medium text-purple-700">{item.student_level}</span>
                                            </div>
                                            <div className="text-[11px] text-purple-800 italic mt-1">🚀 Lộ trình đề xuất: Cần ôn luyện thêm để nâng cấp từ {item.student_level} lên {item.level}.</div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedMissingSkill({
                                                    id: item.student_skill_obj.id, // Truyền ID để Modal tự động PATCH cập nhật level
                                                    skill: item.student_skill_obj.skill,
                                                    skill_name: item.skill_name,
                                                    level: item.level // Gợi ý cập nhật bằng mức yêu cầu của JD
                                                });
                                                setIsModalOpen(true);
                                            }}
                                            className="self-start px-2.5 py-1 bg-purple-600 text-white rounded text-[11px] font-medium hover:bg-purple-700 transition flex items-center gap-1"
                                        >
                                            ✏️ Cập nhật tiến độ học tập
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Sử dụng chung SkillModal có sẵn */}
            <SkillModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedMissingSkill(null);
                }}
                onSuccess={() => {
                    // Tự động phân tích lại sau khi thêm hoặc cập nhật level thành công
                    handleAnalyzeMatch();
                }}
                editingSkill={selectedMissingSkill}
            />
        </div>
    );
}