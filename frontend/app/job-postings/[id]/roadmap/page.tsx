"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

interface SkillItem {
    skill_id: string;
    skill_name: string;
    skill_name_vi: string;
    level: string | null;
}

interface LearningResource {
    id: string;
    title: string;
    url: string;
    description: string;
    level: string;
}

interface InterviewQuestion {
    id: string;
    question_text: string;
    sample_answer: string;
    level: string;
}

interface RoadmapItem {
    id: number;
    skill_id: string;
    skill_name: string;
    skill_name_vi: string;
    target_level: string;
    learning_resources: LearningResource[];
    interview_questions: InterviewQuestion[];
}

interface ApplicationData {
    id: number;
    job_posting: number;
    job_title: string;
    created_at: string;
    student_skills: SkillItem[];
    job_required_skills: SkillItem[];
    roadmaps: RoadmapItem[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Bảng quy đổi cấp độ tương ứng với backend để so sánh cao thấp
const levelHierarchy: Record<string, number> = {
    "Foundation": 1,
    "Applied": 2,
    "Proficient": 3,
    "Advanced": 4,
};

const getLevelScore = (lvl: string | null | undefined) => {
    if (!lvl) return 0;
    return levelHierarchy[lvl] || 0;
};

export default function JobRoadmapPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params?.id as string;

    const [data, setData] = useState<ApplicationData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const fetchAndApplyRoadmap = useCallback(async () => {
        if (!jobId) return;
        try {
            setLoading(true);
            setError("");
            const res = await fetch(`${API_URL}/api/job-postings/${jobId}/apply/`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const errData: any = await res.json();
                throw new Error(errData.error || "Không thể khởi tạo lộ trình học tập.");
            }

            const jsonRes: any = await res.json();
            setData(jsonRes.data);
        } catch (err: any) {
            console.error("Lỗi khi tải lộ trình:", err);
            setError(err.message || "Đã xảy ra lỗi kết nối.");
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        fetchAndApplyRoadmap();
    }, [fetchAndApplyRoadmap]);

    const handleCancelApplication = async () => {
        if (!confirm("Bạn có chắc chắn muốn hủy đơn ứng tuyển và xóa lộ trình học tập này không?")) return;
        try {
            const res = await fetch(`${API_URL}/api/job-postings/${jobId}/apply/`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                alert("Đã hủy đơn ứng tuyển thành công!");
                router.push(`/job-postings/${jobId}`);
            } else {
                alert("Không thể hủy đơn ứng tuyển.");
            }
        } catch (err) {
            console.error("Lỗi hủy đơn:", err);
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-12 text-center text-muted">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Đang phân tích khoảng cách kỹ năng và khởi tạo lộ trình học tập bằng AI...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="max-w-3xl mx-auto p-6 text-center mt-12">
                <div className="p-6 border border-red-200 bg-red-50 text-red-700 rounded-lg mb-4">
                    {error || "Không tìm thấy dữ liệu lộ trình."}
                </div>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-primary text-on-primary rounded-md text-sm font-medium"
                >
                    ← Quay lại
                </button>
            </div>
        );
    }

    // Xử lý so sánh kỹ năng của sinh viên với yêu cầu của job
    const studentSkillMap = new Map(data.student_skills.map(s => [s.skill_id, s.level]));

    const evaluatedJobSkills = data.job_required_skills.map(req => {
        const studentLevel = studentSkillMap.get(req.skill_id) || null;
        // Đạt chuẩn nếu level của sinh viên >= level yêu cầu của job
        const isPassed = getLevelScore(studentLevel) >= getLevelScore(req.level);
        return {
            ...req,
            studentLevel,
            isPassed
        };
    });

    const passedCount = evaluatedJobSkills.filter(s => s.isPassed).length;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                    <button
                        onClick={() => router.push(`/job-postings/${jobId}`)}
                        className="text-sm font-medium text-muted hover:text-text transition mb-2 block"
                    >
                        ← Quay lại chi tiết tin tuyển dụng
                    </button>
                    <h1 className="text-2xl font-bold text-text">Lộ trình học tập & Phân tích khoảng cách kỹ năng</h1>
                    <p className="text-sm text-primary font-medium mt-1">Vị trí: {data.job_title}</p>
                </div>
                <button
                    onClick={handleCancelApplication}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                >
                    Hủy ứng tuyển
                </button>
            </div>

            {/* Phần 1: Tổng quan Skill Gap (So sánh kỹ năng) */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Kỹ năng yêu cầu của Job */}
                <div className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-3">
                    <h2 className="text-md font-semibold text-text flex items-center justify-between">
                        <span>🎯 Kỹ năng yêu cầu từ Công việc</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {data.job_required_skills.length} kỹ năng
                        </span>
                    </h2>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                        {data.job_required_skills.map((item, idx) => (
                            <span key={idx} className="text-xs bg-surface-2 border border-border px-2.5 py-1 rounded-md text-text">
                                {item.skill_name} <strong className="text-primary">({item.level || "N/A"})</strong>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Kỹ năng hiện tại của Sinh viên (Lọc theo kỹ năng job yêu cầu và so sánh level) */}
                <div className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-3">
                    <h2 className="text-md font-semibold text-text flex items-center justify-between">
                        <span>🎒 Hồ sơ của bạn (so với Job)</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${passedCount === evaluatedJobSkills.length ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"}`}>
                            {passedCount}/{evaluatedJobSkills.length} đạt chuẩn
                        </span>
                    </h2>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                        {evaluatedJobSkills.map((item, idx) => (
                            <span
                                key={idx}
                                className={`text-xs px-2.5 py-1 rounded-md border ${
                                    item.isPassed
                                        ? "bg-green-50/50 border-green-200 text-green-800"
                                        : "bg-red-50/50 border-red-200 text-red-700"
                                }`}
                            >
                                {item.skill_name}: <strong>{item.studentLevel || "Chưa có"}</strong> (Cần: {item.level})
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Phần 2: Lộ trình học tập chi tiết (Roadmap) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-text">
                        📚 Lộ trình Bổ sung Kiến thức & Luyện tập ({data.roadmaps.length} kỹ năng cần cải thiện)
                    </h2>
                </div>

                {data.roadmaps.length === 0 ? (
                    <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-6 text-center">
                        🎉 Chúc mừng! Hồ sơ của bạn đã đáp ứng hoặc vượt mức toàn bộ các kỹ năng yêu cầu của vị trí này. Bạn có thể sẵn sàng bước vào vòng phỏng vấn!
                    </div>
                ) : (
                    <div className="space-y-6">
                        {data.roadmaps.map((item, index) => (
                            <div key={item.id} className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                                    <div>
                                        <span className="text-xs font-bold text-muted uppercase">Bước {index + 1}</span>
                                        <h3 className="text-lg font-bold text-text">
                                            {item.skill_name}
                                        </h3>
                                    </div>
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
                                        Mục tiêu đạt: {item.target_level}
                                    </span>
                                </div>

                                {/* Tài liệu học tập gợi ý */}
                                <div>
                                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                        📖 Tài liệu học tập & Chủ đề ôn tập
                                    </h4>
                                    {item.learning_resources.length === 0 ? (
                                        <p className="text-xs text-muted italic">Đang chờ Quản trị viên cập nhật tài liệu học tập cho kỹ năng này.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {item.learning_resources.map((res) => (
                                                <div key={res.id} className="p-3 bg-surface-2/50 border border-border rounded-lg space-y-1">
                                                    <a
                                                        href={res.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                                                    >
                                                        🔗 {res.title}
                                                    </a>
                                                    <p className="text-xs text-muted">{res.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Câu hỏi phỏng vấn luyện tập */}
                                <div>
                                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                        💡 Câu hỏi phỏng vấn mô phỏng
                                    </h4>
                                    {item.interview_questions.length === 0 ? (
                                        <p className="text-xs text-muted italic">Đang cập nhật bộ câu hỏi phỏng vấn...</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {item.interview_questions.map((q) => (
                                                <div key={q.id} className="p-3.5 bg-surface-2/30 border border-border rounded-lg space-y-2">
                                                    <p className="text-sm font-medium text-text">❓ {q.question_text}</p>
                                                    {q.sample_answer && (
                                                        <div className="text-xs text-muted bg-surface p-2.5 rounded border border-border/60">
                                                            <strong className="text-text">Gợi ý trả lời / Ý chính:</strong> {q.sample_answer}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}