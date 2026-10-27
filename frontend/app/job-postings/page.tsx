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

import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";

// Kiểu dữ liệu khớp với Django model JobPosting
interface JobPosting {
    id: number;
    title: string;
    description: string;
    status: "draft" | "published" | "closed";
    created_at: string;
    recruiter: number | { id: number; username?: string; email?: string };
    image?: string | null;
}

// Hàm fetch danh sách từ Django API
async function getJobPostings(search?: string): Promise<JobPosting[]> {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL!}/api/job-postings/`);
    if (search) {
        url.searchParams.append("search", search);
    }

    try {
        const res = await fetch(url.toString(), { cache: "no-store" });
        if (!res.ok) throw new Error("Không thể tải danh sách tin tuyển dụng");
        const data: any = await res.json();
        // Hỗ trợ cả trường hợp DRF trả về phân trang (pagination) hoặc mảng trực tiếp
        return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export default async function JobsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>;
}) {
    const resolvedSearchParams = await searchParams;
    const searchQuery = resolvedSearchParams.search || "";
    const jobs = await getJobPostings(searchQuery);

    // Helper hiển thị badge trạng thái
    const renderStatusBadge = (status: JobPosting["status"]) => {
        switch (status) {
            case "published":
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Đang tuyển
                    </span>
                );
            case "draft":
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-surface-2 text-muted border border-border">
                         Bản nháp
                    </span>
                );
            case "closed":
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                        Đã đóng
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <main className="min-h-screen bg-bg py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text">Danh sách tin tuyển dụng</h1>
                    <p className="text-muted mt-2">
                        Khám phá các cơ hội việc làm hấp dẫn từ các nhà tuyển dụng hàng đầu.
                    </p>
                </div>

                {/* Search Bar */}
                <form method="GET" className="mb-8 flex gap-3">
                    <input
                        type="text"
                        name="search"
                        defaultValue={searchQuery}
                        placeholder="Tìm kiếm theo tiêu đề..."
                        className="flex-1 bg-surface border border-border rounded-md px-4 py-3 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                    <button
                        type="submit"
                        className="bg-primary text-on-primary px-6 py-3 rounded-md font-medium hover:opacity-95 transition-opacity"
                    >
                        Tìm kiếm
                    </button>
                </form>

                {/* Job List Grid */}
                {jobs.length === 0 ? (
                    <div className="bg-surface border border-border rounded-lg p-12 text-center text-muted">
                        Không tìm thấy tin tuyển dụng nào phù hợp.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {jobs.map((job) => (
                            <Link
                                key={job.id}
                                href={`/job-postings/${job.id}`}
                                className="block bg-surface border border-border rounded-lg p-5 hover:shadow-sm hover:border-primary transition-all group"
                            >
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                    {/* Phần hiển thị ảnh công việc / logo */}
                                    <div className="relative w-full sm:w-24 h-36 sm:h-24 flex-shrink-0 rounded-md overflow-hidden bg-surface-2 border border-border">
                                        <SafeImage
                                            src={job.image}
                                            alt={job.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            fallback="/default-image.png" 
                                        />
                                    </div>

                                    {/* Phần nội dung thông tin */}
                                    <div className="flex-1 w-full min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                            <h2 className="text-xl font-semibold text-text group-hover:text-primary transition-colors">
                                                {job.title}
                                            </h2>
                                            {renderStatusBadge(job.status)}
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-border">
                                            <span>
                                                Ngày đăng: {new Date(job.created_at).toLocaleDateString("vi-VN")}
                                            </span>
                                            <span className="text-primary font-medium group-hover:underline">
                                                Xem chi tiết &rarr;
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}