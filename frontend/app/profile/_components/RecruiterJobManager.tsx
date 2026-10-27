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

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "./_TiptapEditor";

interface JobPosting {
    id: number;
    title: string;
    description: string;
    status: "draft" | "published" | "closed";
    created_at: string;
    updated_at: string;
}

interface RecruiterJobManagerProps {
    initialJobs: JobPosting[];
    onJobsChange: () => void;
}

export default function RecruiterJobManager({ initialJobs, onJobsChange }: RecruiterJobManagerProps) {
    const router = useRouter();
    const [isJobModalOpen, setIsJobModalOpen] = useState<boolean>(false);
    const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
    const [jobForm, setJobForm] = useState({ title: "", description: "", status: "draft" });
    const [loadingAction, setLoadingAction] = useState<boolean>(false);

    // Xử lý Thêm / Sửa Job Posting
    const handleSaveJob = async (e: React.FormEvent, targetStatus: "draft" | "published") => {
        e.preventDefault();

        const payload = { ...jobForm, status: targetStatus };

        const url = editingJob
            ? `${process.env.NEXT_PUBLIC_API_URL!}/api/me/job-postings/${editingJob.id}/`
            : `${process.env.NEXT_PUBLIC_API_URL!}/api/me/job-postings/`;
        const method = editingJob ? "PUT" : "POST";

        try {
            setLoadingAction(true);
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const savedData: JobPosting = await res.json();
                setIsJobModalOpen(false);
                setEditingJob(null);
                setJobForm({ title: "", description: "", status: "draft" });
                onJobsChange();

                // Nếu bấm nút "Xuất bản", chuyển hướng sang trang analyze, ngược lại có thể sang trang chi tiết
                const jobId = savedData.id || editingJob?.id;
                if (jobId) {
                    if (targetStatus === "published") {
                        router.push(`/profile/job-postings/${jobId}/analyze`);
                    } else {
                        router.push(`/profile/job-postings/${jobId}`);
                    }
                }
            } else {
                alert("Có lỗi xảy ra khi lưu tin tuyển dụng.");
            }
        } catch (err) {
            console.error("Lỗi khi gửi request:", err);
        } finally {
            setLoadingAction(false);
        }
    };

    // Xử lý Xóa Job Posting
    const handleDeleteJob = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn sự kiện click lan ra thẻ div bọc ngoài
        if (!confirm("Bạn có chắc chắn muốn xóa tin tuyển dụng này?")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL!}/api/me/job-postings/${id}/`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                onJobsChange();
            } else {
                alert("Không thể xóa tin tuyển dụng này.");
            }
        } catch (err) {
            console.error("Lỗi khi xóa tin:", err);
        }
    };

    return (
        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold">Danh sách tin tuyển dụng</h2>
                    <p className="text-sm text-muted">Quản lý các vị trí việc làm bạn đã đăng</p>
                </div>
                <button
                    onClick={() => {
                        setEditingJob(null);
                        setJobForm({ title: "", description: "", status: "draft" });
                        setIsJobModalOpen(true);
                    }}
                    className="px-4 py-2 bg-primary text-on-primary text-sm font-medium rounded-md hover:opacity-90 transition"
                >
                    + Đăng tin mới
                </button>
            </div>

            {initialJobs.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                    <p className="text-muted">Bạn chưa đăng tin tuyển dụng nào.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {initialJobs.map((job) => (
                        <div
                            key={job.id}
                            onClick={() => router.push(`/profile/job-postings/${job.id}`)} // Click vào card để xem trang chi tiết
                            className="p-4 border border-border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-2/50 cursor-pointer hover:border-primary transition group"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-base group-hover:text-primary transition">{job.title}</h3>
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            job.status === "published"
                                                ? "bg-green-100 text-green-700"
                                                : job.status === "draft"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {job.status === "published" ? "Đang tuyển" : job.status === "draft" ? "Bản nháp" : "Đã đóng"}
                                    </span>
                                </div>
                                <div className="text-sm text-muted line-clamp-2" dangerouslySetInnerHTML={{ __html: job.description }} />
                                <span className="text-xs text-muted">
                                    Ngày đăng: {new Date(job.created_at).toLocaleDateString("vi-VN")}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Ngăn chuyển trang khi bấm Sửa
                                        setEditingJob(job);
                                        setJobForm({ title: job.title, description: job.description, status: job.status });
                                        setIsJobModalOpen(true);
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium border border-border rounded hover:bg-surface-2 transition"
                                >
                                    Sửa
                                </button>
                                <button
                                    onClick={(e) => handleDeleteJob(job.id, e)}
                                    className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded hover:bg-red-50 transition"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL THÊM / SỬA TIN TUYỂN DỤNG */}
            {isJobModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-surface border border-border rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface">
                            <h3 className="text-lg font-bold">
                                {editingJob ? "Chỉnh sửa tin tuyển dụng" : "Đăng tin tuyển dụng mới"}
                            </h3>
                            <button
                                onClick={() => setIsJobModalOpen(false)}
                                className="text-muted hover:text-text transition text-lg font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 overflow-y-auto flex-1 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tiêu đề công việc</label>
                                    <input
                                        type="text"
                                        required
                                        value={jobForm.title}
                                        onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-md bg-bg text-text focus:outline-none focus:ring-1 focus:ring-primary"
                                        placeholder="Ví dụ: Làm việc văn phòng"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Mô tả chi tiết công việc</label>
                                    <TiptapEditor
                                        key={editingJob ? editingJob.id : "new"}
                                        content={jobForm.description}
                                        onChange={(htmlContent) => setJobForm({ ...jobForm, description: htmlContent })}
                                    />
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-surface">
                                <button
                                    type="button"
                                    onClick={() => setIsJobModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-surface-2 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    disabled={loadingAction}
                                    onClick={(e) => handleSaveJob(e, "draft")}
                                    className="px-4 py-2 text-sm font-medium border border-border bg-surface-2 text-text rounded-md hover:opacity-80 transition disabled:opacity-50"
                                >
                                    {loadingAction ? "Đang xử lý..." : "Lưu nháp"}
                                </button>
                                <button
                                    type="button"
                                    disabled={loadingAction}
                                    onClick={(e) => handleSaveJob(e, "published")}
                                    className="px-4 py-2 text-sm font-medium bg-primary text-on-primary rounded-md hover:opacity-90 transition disabled:opacity-50"
                                >
                                    {loadingAction ? "Đang xử lý..." : "Xuất bản"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}