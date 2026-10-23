"use client";

import { useState, useEffect } from "react";

interface HealthStatus {
    status: "idle" | "loading" | "online" | "offline";
    data?: { status?: string; message?: string };
    error?: string;
    checkedAt?: string;
}

export default function DevDocsPage() {
    const [health, setHealth] = useState<HealthStatus>({ status: "idle" });

    const checkBackendHealth = async () => {
        setHealth({ status: "loading" });
        try {
            const res = await fetch("http://127.0.0.1:8001/api/health/", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: Không thể lấy phản hồi từ server`);
            }

            const data: any = await res.json();
            setHealth({
                status: "online",
                data,
                checkedAt: new Date().toLocaleTimeString(),
            });
        } catch (err: any) {
            setHealth({
                status: "offline",
                error: err?.message || "Không thể kết nối tới Backend tại cổng 8001",
                checkedAt: new Date().toLocaleTimeString(),
            });
        }
    };

    // Tự động kiểm tra 1 lần khi load trang
    useEffect(() => {
        checkBackendHealth();
    }, []);

    return (
        <div className="min-h-screen bg-bg text-text p-6 md:p-10 max-w-6xl mx-auto space-y-8">
            {/* Header Trang Tài Liệu DEV */}
            <header className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-primary-soft text-primary text-xs font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider">
                            Internal Only
                        </span>
                        <span className="bg-surface-2 text-muted text-xs font-medium px-2.5 py-1 rounded-sm">
                            DEV Hub
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-text">
                        Developer Documentation & Guidelines
                    </h1>
                    <p className="text-muted text-sm mt-1">
                        Trung tâm tài liệu nội bộ, quy chuẩn codebase và công cụ test kết nối hệ thống.
                    </p>
                </div>

                {/* Nút bấm chuyển nhanh */}
                <div className="flex items-center gap-3">
                    <a
                        href="/"
                        className="text-xs font-semibold px-4 py-2.5 bg-surface border border-border rounded-sm hover:bg-surface-2 transition text-text"
                    >
                        ← Về Trang Chủ
                    </a>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CỘT TRÁI (2/3): Tài liệu & Quy chuẩn cho Team */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Section 1: Quy tắc Design System */}
                    <section className="bg-surface border border-border rounded-lg p-6 space-y-4">
                        <h2 className="text-xl font-bold text-text flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                            1. Quy Chuẩn Design Tokens (Tailwind v4)
                        </h2>
                        <p className="text-muted text-sm leading-relaxed">
                            Toàn bộ dự án tuân thủ mô hình token định nghĩa sẵn tại <code className="bg-surface-2 px-1.5 py-0.5 rounded-sm text-text font-mono text-xs">globals.css</code>. Tuyệt đối không tự viết mã màu HEX thủ công hay viết CSS class rời rạc.
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2">
                            <div className="bg-surface-2 p-3 rounded-md border border-border">
                                <span className="block text-muted font-mono mb-1">bg-primary</span>
                                <span className="font-bold text-primary">#3346f0 (Chính)</span>
                            </div>
                            <div className="bg-surface-2 p-3 rounded-md border border-border">
                                <span className="block text-muted font-mono mb-1">bg-accent</span>
                                <span className="font-bold text-accent">#ffb224 (Nhấn)</span>
                            </div>
                            <div className="bg-surface-2 p-3 rounded-md border border-border">
                                <span className="block text-muted font-mono mb-1">bg-surface</span>
                                <span className="font-bold text-text">#ffffff (Khối)</span>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Nguyên tắc Codebase */}
                    <section className="bg-surface border border-border rounded-lg p-6 space-y-4">
                        <h2 className="text-xl font-bold text-text flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block"></span>
                            2. Nguyên Tắc Phát Triển
                        </h2>
                        <ul className="space-y-3 text-sm text-muted list-disc list-inside">
                            <li>
                                <strong className="text-text">Light Mode Only:</strong> Hệ thống cố định giao diện sáng. Không tạo thêm class <code className="bg-surface-2 px-1 py-0.5 rounded-sm text-text font-mono text-xs">dark:*</code>.
                            </li>
                            <li>
                                <strong className="text-text">Bo góc tiêu chuẩn:</strong> Sử dụng <code className="bg-surface-2 px-1 py-0.5 rounded-sm text-text font-mono text-xs">rounded-sm</code> (8px), <code className="bg-surface-2 px-1 py-0.5 rounded-sm text-text font-mono text-xs">rounded-md</code> (16px), <code className="bg-surface-2 px-1 py-0.5 rounded-sm text-text font-mono text-xs">rounded-lg</code> (28px).
                            </li>
                            <li>
                                <strong className="text-text">Giao tiếp Backend:</strong> Gọi API Django tại các endpoint chuẩn dưới cổng <code className="bg-surface-2 px-1 py-0.5 rounded-sm text-text font-mono text-xs">8001</code>.
                            </li>
                        </ul>
                    </section>
                </div>

                {/* CỘT PHẢI (1/3): Widget Kiểm Tra Backend Connection */}
                <div className="space-y-6">
                    <section className="bg-surface border border-border rounded-lg p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-text">Backend Status</h2>
                            <span className="text-xs font-mono text-muted">PORT 8001</span>
                        </div>

                        {/* Màn hình Trạng thái Kết nối */}
                        <div className="bg-surface-2 p-4 rounded-md border border-border space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted uppercase">Endpoint:</span>
                                <span className="text-xs font-mono text-text bg-surface px-2 py-0.5 rounded border border-border">
                                    /api/health/
                                </span>
                            </div>

                            {/* Status Indicator */}
                            <div className="flex items-center gap-3 pt-2">
                                {health.status === "loading" && (
                                    <>
                                        <span className="w-3 h-3 rounded-full bg-accent animate-ping"></span>
                                        <span className="text-sm font-semibold text-muted">Đang kết nối...</span>
                                    </>
                                )}

                                {health.status === "online" && (
                                    <>
                                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                        <span className="text-sm font-bold text-emerald-600">Online & Ready</span>
                                    </>
                                )}

                                {health.status === "offline" && (
                                    <>
                                        <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                                        <span className="text-sm font-bold text-rose-600">Offline / Error</span>
                                    </>
                                )}

                                {health.status === "idle" && (
                                    <span className="text-sm text-muted">Chưa kiểm tra</span>
                                )}
                            </div>

                            {/* Data phản hồi từ Django */}
                            {health.data && (
                                <div className="mt-3 p-3 bg-surface rounded border border-border text-xs font-mono space-y-1">
                                    <p className="text-emerald-600 font-semibold">✔ status: {health.data.status}</p>
                                    <p className="text-muted break-words">{health.data.message}</p>
                                </div>
                            )}

                            {/* Lỗi hiển thị nếu kết nối thất bại & Hướng dẫn xử lý Docker */}
                            {health.error && (
                                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs space-y-3">
                                    <div>
                                        <p className="font-semibold">Lỗi kết nối:</p>
                                        <p className="mt-0.5">{health.error}</p>
                                    </div>

                                    {/* Hướng dẫn mở Docker Desktop */}
                                    <div className="pt-2 border-t border-rose-200/60 font-medium text-rose-800">
                                        💡 <strong>Yêu cầu:</strong> Vui lòng mở <strong>Docker Desktop</strong> và khởi động lại container backend trên cổng 8001.
                                    </div>

                                    {/* Nút báo cáo nhóm trưởng */}
                                    <button
                                        onClick={() => {
                                            const reportText = `[BÁO CÁO LỖI BACKEND]\n- Thời gian: ${health.checkedAt}\n- Lỗi: ${health.error}\n- Trạng thái: Backend offline / Yêu cầu bật Docker Desktop.`;
                                            navigator.clipboard.writeText(reportText);
                                            alert("Đã copy nội dung báo cáo lỗi! Hãy dán (Paste) vào khung chat của nhóm trưởng.");
                                        }}
                                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-3 rounded transition text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                                    >
                                        📤 Báo cáo lỗi cho Nhóm trưởng
                                    </button>
                                </div>
                            )}

                            {health.checkedAt && (
                                <p className="text-[10px] text-muted text-right pt-1">
                                    Cập nhật lúc: {health.checkedAt}
                                </p>
                            )}
                        </div>

                        {/* Nút trigger kiểm tra thủ công */}
                        <button
                            onClick={checkBackendHealth}
                            disabled={health.status === "loading"}
                            className="w-full bg-primary text-on-primary font-semibold text-sm py-2.5 rounded-sm hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                        >
                            {health.status === "loading" ? "Đang ping..." : "Ping Backend (8001)"}
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}