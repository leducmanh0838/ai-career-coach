"use client";

import { memo, useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import JobPostingSkillModal from "../_components/JobPostingSkillModal"; // Sử dụng modal kỹ năng của Job Posting đã tạo trước đó
import {
    Cpu,
    BrainCircuit,
    CheckCircle2,
    Sparkles,
    ShieldCheck,
    AlertCircle
} from "lucide-react";

interface JobRequiredSkill {
    id: number;
    skill: number | null;
    skill_name: string;
    level: string | null;
    reasoning: string | null;
    evidence: any[];
}

interface JobPostingDetail {
    id: number;
    title: string;
    description: string;
    status: "draft" | "published" | "closed";
    required_skills: JobRequiredSkill[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function AnalyzeJDPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params?.id as string;

    const [job, setJob] = useState<JobPostingDetail | null>(null);
    const [useMock] = useState<boolean>(false);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [progressPercent, setProgressPercent] = useState<number>(10);
    const [analysisResult, setAnalysisResult] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    // State quản lý danh sách kỹ năng yêu cầu thực tế từ DB của Job này
    const [jobSkills, setJobSkills] = useState<any[]>([]);
    const [isSkillModalOpen, setIsSkillModalOpen] = useState<boolean>(false);
    const [editingSkill, setEditingSkill] = useState<any | null>(null);

    // 1. Lấy thông tin chi tiết Job Posting trước
    const fetchJobDetail = useCallback(async () => {
        if (!jobId) return;
        try {
            const res = await fetch(`${API_URL}/api/me/job-postings/${jobId}/`, {
                credentials: "include",
            });
            if (res.ok) {
                const data: JobPostingDetail = await res.json();
                setJob(data);
                setJobSkills(data.required_skills || []);

                // Sau khi có nội dung mô tả của Job, tự động kích hoạt tiến trình phân tích AI
                if (data.description) {
                    startStreamingAnalysis(data.description);
                }
            } else {
                throw new Error("Không thể tải thông tin tin tuyển dụng.");
            }
        } catch (err: any) {
            setError(err.message || "Lỗi tải dữ liệu tin tuyển dụng.");
        }
    }, [jobId]);

    // Hàm tải lại danh sách kỹ năng sau khi thêm/sửa/xóa
    const fetchJobSkills = async () => {
        if (!jobId) return;
        try {
            const res = await fetch(`${API_URL}/api/me/job-postings/${jobId}/`, {
                credentials: "include",
            });
            if (res.ok) {
                const data: JobPostingDetail = await res.json();
                setJobSkills(data.required_skills || []);
            }
        } catch (err) {
            console.error("Lỗi tải danh sách kỹ năng yêu cầu:", err);
        }
    };

    const getLevelBadgeConfig = (level: string | null | undefined) => {
        if (!level) return { label: "Chưa đánh giá", className: "bg-amber-50 text-amber-700 border-amber-200" };
        switch (level.toLowerCase()) {
            case "foundation": return { label: "Nền tảng", className: "bg-surface-2 text-muted border-border" };
            case "applied": return { label: "Thực hành", className: "bg-primary-soft text-primary border-border" };
            case "proficient": return { label: "Thành thạo", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
            case "advanced": return { label: "Nâng cao", className: "bg-purple-50 text-purple-700 border-purple-200" };
            default: return { label: level, className: "bg-surface-2 text-muted border-border" };
        }
    };

    useEffect(() => {
        fetchJobDetail();
    }, [fetchJobDetail]);

    // 2. Tiến trình Streaming AI phân tích nội dung JD
    const startStreamingAnalysis = async (textDescription: string) => {
        setIsAnalyzing(true);
        setError(null);
        setProgressPercent(10);

        const progressInterval = setInterval(() => {
            setProgressPercent((prev) => {
                if (prev >= 90) return prev;
                const increment = prev < 40 ? 3 : prev < 70 ? 1.5 : 0.5;
                return Math.min(90, prev + increment);
            });
        }, 400);

        // Gửi payload dạng JSON hoặc FormData chứa text_content và job_posting_id
        const payload = {
            text_content: textDescription,
            doc_type: "jd",
            job_posting_id: jobId,
            use_mock: useMock,
            skill_top_k: 5
        };

        try {
            const res = await fetch(`${API_URL}/api/ai/analyze-stream`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
                credentials: "include",
            });

            if (!res.ok) throw new Error(`Lỗi kết nối Server: ${res.statusText}`);
            if (!res.body) throw new Error("Trình duyệt không hỗ trợ Stream Response.");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const decodedChunk = decoder.decode(value, { stream: true });
                buffer += decodedChunk;

                const lines = buffer.split(/\r?\n\r?\n|\r?\n/);
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith("data: ")) {
                        const jsonString = trimmedLine.replace("data: ", "").trim();
                        try {
                            const eventData = JSON.parse(jsonString);

                            if (eventData.progress) {
                                setProgressPercent(eventData.progress);
                            }

                            if (
                                eventData.status === "SUCCESS" ||
                                eventData.data?.skills ||
                                eventData.skills ||
                                eventData.result?.skills
                            ) {
                                clearInterval(progressInterval);
                                setAnalysisResult(eventData);
                                setProgressPercent(100);
                                fetchJobSkills(); // Đồng bộ lại danh sách kỹ năng mới lưu vào DB
                            }

                            if (eventData.status === "FAILED" || eventData.error) {
                                throw new Error(eventData.error || "Quá trình phân tích gặp lỗi.");
                            }
                        } catch (parseErr) {
                            // Bỏ qua lỗi parse nếu chunk chưa trọn vẹn
                        }
                    }
                }
            }
        } catch (err: any) {
            clearInterval(progressInterval);
            setError(err.message || "Đã xảy ra lỗi không xác định.");
        } finally {
            clearInterval(progressInterval);
            setIsAnalyzing(false);
        }
    };

    const handleOpenAddSkill = () => {
        setEditingSkill(null);
        setIsSkillModalOpen(true);
    };

    const handleOpenEditSkill = (item: any) => {
        setEditingSkill(item);
        setIsSkillModalOpen(true);
    };

    const handleDeleteSkill = async (item: any) => {
        if (!confirm(`Bạn có chắc muốn xóa kỹ năng "${item.skill_name}" khỏi tin tuyển dụng này không?`)) {
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/me/job-postings/${jobId}/skills/${item.id}/`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) throw new Error("Không thể xóa kỹ năng.");
            fetchJobSkills();
        } catch (err: any) {
            alert(err.message || "Lỗi khi xóa kỹ năng.");
        }
    };

    if (!job && !error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-muted">
                Đang tải dữ liệu tin tuyển dụng...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg text-text py-10 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2 text-text">
                            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                            Trợ lý AI Đang Phân tích Mô tả Công việc (JD)
                        </h1>
                        <p className="text-sm text-muted mt-1">
                            Vị trí: <span className="font-semibold text-primary">{job?.title}</span>
                        </p>
                    </div>
                    <Link
                        href={`/profile/job-postings/${jobId}`}
                        className="px-4 py-2 text-sm font-medium bg-surface border border-border hover:bg-surface-2 rounded-sm shadow-sm transition text-text"
                    >
                        Quay lại chi tiết Job
                    </Link>
                </div>

                {/* Thanh tiến trình phân tích */}
                {isAnalyzing && (
                    <div className="bg-surface border border-border rounded-lg p-8 shadow-sm backdrop-blur-md space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold text-muted uppercase tracking-wider">
                                <span>Đang đọc hiểu và trích xuất kỹ năng yêu cầu...</span>
                                <span className="text-primary">{Math.round(progressPercent)}%</span>
                            </div>
                            <div className="w-full bg-surface-2 rounded-full h-4 overflow-hidden p-0.5 border border-border">
                                <div
                                    className="bg-primary h-full rounded-full transition-all duration-300 ease-out relative shadow-inner transform-gpu"
                                    style={{ width: `${progressPercent}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/25 animate-[shimmer_2s_infinite] rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-sm text-sm flex items-center space-x-3 shadow-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Kết quả phân tích */}
                {analysisResult && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="p-6 bg-primary-soft border border-border rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-primary text-on-primary rounded-lg flex items-center justify-center shadow-sm">
                                    <CheckCircle2 className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-text">Phân tích JD hoàn tất! 🎉</h3>
                                    <p className="text-xs text-muted mt-0.5">
                                        {analysisResult.message || "Hệ thống đã trích xuất và lưu các kỹ năng yêu cầu thành công vào cơ sở dữ liệu."}
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={`/profile/job-postings/${jobId}`}
                                className="px-5 py-2.5 text-xs font-semibold bg-primary hover:opacity-90 text-on-primary rounded-sm shadow-sm transition whitespace-nowrap"
                            >
                                Hoàn tất & Xem tin tuyển dụng
                            </Link>
                        </div>

                        {/* Danh sách Kỹ năng yêu cầu lấy từ DB */}
                        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold flex items-center gap-2 text-text">
                                    <BrainCircuit className="w-5 h-5 text-primary" />
                                    Danh sách kỹ năng yêu cầu cho vị trí ({jobSkills.length})
                                </h2>
                                <button
                                    onClick={handleOpenAddSkill}
                                    className="px-3 py-1.5 text-xs font-medium bg-primary hover:opacity-90 text-on-primary rounded-sm transition shadow-sm"
                                >
                                    + Thêm kỹ năng
                                </button>
                            </div>

                            {jobSkills.length === 0 ? (
                                <div className="space-y-3 py-6 text-center">
                                    <p className="text-sm text-muted font-medium">Chưa có kỹ năng yêu cầu nào được ghi nhận.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {[...jobSkills]
                                        .sort((a, b) => Number(a.id) - Number(b.id))
                                        .map((item: any) => {
                                            const badge = getLevelBadgeConfig(item.level);

                                            return (
                                                <div key={item.id} className="p-5 rounded-lg border border-border bg-surface-2 hover:border-primary transition-all space-y-3 shadow-2xs">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <h3 className="font-bold text-base text-text flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                                                            {item.skill_name || "Kỹ năng"}
                                                        </h3>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-3 py-1 text-xs font-semibold border rounded-full shadow-2xs ${badge.className}`}>
                                                                {badge.label}
                                                            </span>
                                                            <button
                                                                onClick={() => handleOpenEditSkill(item)}
                                                                className="px-2.5 py-1 text-xs font-medium bg-surface hover:opacity-80 text-muted rounded-sm transition border border-border"
                                                                title="Chỉnh sửa mức độ kỹ năng"
                                                            >
                                                                Sửa
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteSkill(item)}
                                                                className="px-2 py-1 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 rounded-sm transition border border-red-200"
                                                                title="Xóa kỹ năng"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {item.reasoning && (
                                                        <p className="text-xs text-muted leading-relaxed bg-surface p-3 rounded-sm border border-border">
                                                            <span className="font-semibold text-text">🤖 AI Đánh giá: </span>
                                                            {item.reasoning}
                                                        </p>
                                                    )}

                                                    {item.evidence && item.evidence.length > 0 && (
                                                        <div className="text-xs text-muted bg-surface p-3 rounded-sm border border-border space-y-1">
                                                            <span className="font-semibold block text-text flex items-center gap-1.5">
                                                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                                                Minh chứng trích xuất từ JD:
                                                            </span>
                                                            <ul className="list-disc list-inside space-y-1 italic pl-1">
                                                                {item.evidence.map((ev: string, eIdx: number) => (
                                                                    <li key={eIdx} className="text-muted">&ldquo;{ev}&rdquo;</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>

            {/* Modal Thêm / Sửa kỹ năng yêu cầu của Job */}
            <JobPostingSkillModal
                isOpen={isSkillModalOpen}
                onClose={() => setIsSkillModalOpen(false)}
                onSuccess={() => {
                    fetchJobSkills();
                }}
                jobId={jobId}
                editingSkill={editingSkill}
            />
        </div>
    );
}

export default memo(AnalyzeJDPage);