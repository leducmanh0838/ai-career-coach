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

import React, { useState } from "react";

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

interface SkillDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    skillItem: RoadmapItem | null;
    formatLevelFraction: (lvl: string | null | undefined) => string;
}

interface QuestionEvaluation {
    question_id: string;
    question_text: string;
    user_answer: string;
    score: number;
    feedback: string;
}

interface EvaluationResult {
    average_score: number;
    passed: boolean;
    details: QuestionEvaluation[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function SkillDetailModal({
    isOpen,
    onClose,
    skillItem,
    formatLevelFraction,
}: SkillDetailModalProps) {
    // Trạng thái quản lý chế độ làm bài (false: xem tài liệu/câu hỏi, true: đang làm bài test)
    const [isTesting, setIsTesting] = useState(false);
    // Lưu trữ câu trả lời của sinh viên theo từng question_id
    const [answers, setAnswers] = useState<Record<string, string>>({});
    // Trạng thái loading khi đang gọi API chấm điểm
    const [submitting, setSubmitting] = useState(false);
    // Lưu kết quả trả về từ API chấm điểm
    const [result, setResult] = useState<EvaluationResult | null>(null);

    if (!isOpen || !skillItem) return null;

    // Reset trạng thái khi đóng modal
    const handleCloseModal = () => {
        setIsTesting(false);
        setAnswers({});
        setResult(null);
        onClose();
    };

    // Xử lý khi nhập câu trả lời
    const handleAnswerChange = (questionId: string, text: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: text }));
    };

    // Gửi bài làm lên API chấm điểm
    const handleSubmitTest = async () => {
        if (!skillItem.interview_questions || skillItem.interview_questions.length === 0) {
            alert("Kỹ năng này chưa có câu hỏi phỏng vấn để làm bài test.");
            return;
        }

        // Kiểm tra xem sinh viên đã điền ít nhất 1 câu chưa
        const formattedAnswers = Object.entries(answers)
            .filter(([_, val]) => val.trim() !== "")
            .map(([qId, val]) => ({
                question_id: qId,
                user_answer: val,
            }));

        if (formattedAnswers.length === 0) {
            alert("Vui lòng trả lời ít nhất một câu hỏi trước khi nộp bài!");
            return;
        }

        try {
            setSubmitting(true);
            const res = await fetch(`${API_URL}/api/interview/submit/`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    skill_id: skillItem.skill_id,
                    level: skillItem.target_level,
                    answers: formattedAnswers,
                }),
            });

            if (!res.ok) {
                const errData: any = await res.json();
                throw new Error(errData.error || "Không thể nộp bài phỏng vấn.");
            }

            const jsonRes: any= await res.json();
            setResult(jsonRes.data);
        } catch (err: any) {
            console.error("Lỗi nộp bài test:", err);
            alert(err.message || "Đã xảy ra lỗi kết nối khi nộp bài.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 shadow-xl space-y-6">

                {/* Header Modal */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full font-semibold">
                            Mục tiêu: {formatLevelFraction(skillItem.target_level)}
                        </span>
                        <h2 className="text-xl font-bold text-text mt-1">
                            {skillItem.skill_name_vi || skillItem.skill_name}
                        </h2>
                    </div>
                    <button
                        onClick={handleCloseModal}
                        className="text-muted hover:text-text p-2 rounded-lg bg-surface-2 text-sm font-bold transition"
                    >
                        ✕ Đóng
                    </button>
                </div>

                {/* Nếu chưa có kết quả chấm điểm */}
                {!result ? (
                    <>
                        {/* Banner chuyển đổi chế độ làm bài */}
                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between gap-4">
                            <div>
                                <h4 className="text-sm font-bold text-primary">
                                    {isTesting ? "✍️ Đang trong chế độ làm bài thi mô phỏng" : "🎯 Sẵn sàng kiểm tra năng lực?"}
                                </h4>
                                <p className="text-xs text-muted mt-0.5">
                                    {isTesting
                                        ? "Hãy điền câu trả lời của bạn vào các câu hỏi dưới đây và bấm Nộp bài để AI đánh giá."
                                        : "Tham gia bài thi phỏng vấn mô phỏng để hệ thống tự động đánh giá và cập nhật kỹ năng vào hồ sơ."
                                    }
                                </p>
                            </div>
                            {!isTesting ? (
                                <button
                                    onClick={() => setIsTesting(true)}
                                    className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold shadow hover:opacity-90 transition whitespace-nowrap"
                                >
                                    📝 Làm bài Test ngay
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsTesting(false)}
                                    className="px-3 py-1.5 border border-border bg-surface text-text rounded-lg text-xs font-medium hover:bg-surface-2 transition whitespace-nowrap"
                                >
                                    ← Quay lại ôn tập
                                </button>
                            )}
                        </div>

                        {/* Nếu KHÔNG ở chế độ test: Hiển thị tài liệu & danh sách câu hỏi chỉ đọc */}
                        {!isTesting ? (
                            <div className="space-y-6">
                                {/* Tài liệu học tập */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-text uppercase tracking-wider flex items-center gap-2">
                                        📖 Tài liệu học tập & Chủ đề ôn tập ({skillItem.learning_resources.length})
                                    </h3>
                                    {skillItem.learning_resources.length === 0 ? (
                                        <p className="text-xs text-muted italic">Đang chờ Quản trị viên cập nhật tài liệu học tập cho kỹ năng này.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {skillItem.learning_resources.map((res) => (
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

                                {/* Câu hỏi phỏng vấn (CHỈ HIỂN THỊ CÂU HỎI, KHÔNG HIỂN THỊ CÂU TRẢ LỜI) */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-text uppercase tracking-wider flex items-center gap-2">
                                        💡 Câu hỏi phỏng vấn luyện tập ({skillItem.interview_questions.length})
                                    </h3>
                                    {skillItem.interview_questions.length === 0 ? (
                                        <p className="text-xs text-muted italic">Đang cập nhật bộ câu hỏi phỏng vấn...</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {skillItem.interview_questions.map((q, qIdx) => (
                                                <div key={q.id} className="p-3.5 bg-surface-2/30 border border-border rounded-lg space-y-1">
                                                    <p className="text-sm font-medium text-text">
                                                        Câu {qIdx + 1}: {q.question_text}
                                                    </p>
                                                    <p className="text-xs text-muted italic">
                                                        (Hãy tự luyện tập trả lời câu hỏi này để chuẩn bị tốt nhất cho buổi phỏng vấn thực tế)
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Nếu Ở CHẾ ĐỘ TEST: Hiển thị form input để sinh viên nhập câu trả lời */
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-text uppercase tracking-wider">
                                    📝 Trả lời các câu hỏi phỏng vấn
                                </h3>
                                {skillItem.interview_questions.map((q, qIdx) => (
                                    <div key={q.id} className="p-4 bg-surface-2/30 border border-border rounded-xl space-y-2">
                                        <p className="text-sm font-medium text-text">
                                            <span className="font-bold text-primary">Câu {qIdx + 1}:</span> {q.question_text}
                                        </p>
                                        <textarea
                                            rows={3}
                                            placeholder="Nhập câu trả lời chi tiết của bạn ở đây..."
                                            value={answers[q.id] || ""}
                                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                            className="w-full p-3 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:border-primary text-text resize-y"
                                        />
                                    </div>
                                ))}

                                <div className="pt-2 flex justify-end gap-3">
                                    <button
                                        onClick={() => setIsTesting(false)}
                                        className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-muted hover:text-text transition"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        onClick={handleSubmitTest}
                                        disabled={submitting}
                                        className="px-6 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold shadow hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                                        {submitting ? "Đang chấm điểm qua AI..." : "🚀 Nộp bài & Nhận kết quả"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* Hiển thị kết quả chấm điểm khi API trả về */
                    <div className="space-y-6">
                        <div className={`p-5 rounded-xl border text-center space-y-2 ${result.passed ? "bg-green-50 border-green-200 text-green-800" : "bg-yellow-50 border-yellow-200 text-yellow-800"}`}>
                            <h3 className="text-lg font-bold">
                                {result.passed ? "🎉 Chúc mừng bạn đã vượt qua bài kiểm tra!" : "💪 Cần cố gắng thêm lần sau!"}
                            </h3>
                            <p className="text-sm">
                                Điểm trung bình của bạn: <strong className="text-base">{result.average_score} / 10</strong>
                                {result.passed ? " (Đạt chuẩn yêu cầu >= 5.0)" : " (Chưa đạt mức tối thiểu 5.0)"}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">
                                📊 Chi tiết đánh giá từ AI cho từng câu:
                            </h4>
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                                {result.details.map((detail, idx) => (
                                    <div key={idx} className="p-4 bg-surface-2/40 border border-border rounded-xl space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-medium text-text">
                                                <strong>Q{idx + 1}:</strong> {detail.question_text}
                                            </p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${detail.score >= 5 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {detail.score} / 10 điểm
                                            </span>
                                        </div>
                                        <p className="text-xs bg-surface p-2.5 rounded border border-border/60 text-muted">
                                            <strong>Câu trả lời của bạn:</strong> {detail.user_answer || "(Không trả lời)"}
                                        </p>
                                        <p className="text-xs text-text bg-primary/5 p-2.5 rounded border border-primary/10">
                                            <strong>Nhận xét từ AI:</strong> {detail.feedback}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleCloseModal}
                                className="px-6 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold shadow hover:opacity-90 transition"
                            >
                                Hoàn tất & Đóng
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}