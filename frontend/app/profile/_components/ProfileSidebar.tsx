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

'use client';

import SafeImage from "@/components/ui/SafeImage";
import { UserProfile } from "../_types";
import { useAuth } from "@/context/AuthContext"; // Import useAuth để check role

interface ProfileSidebarProps {
    profile: UserProfile;
    onOpenUploadModal: () => void;
}

export default function ProfileSidebar({ profile, onOpenUploadModal }: ProfileSidebarProps) {
    const { user } = useAuth();
    const fullName = `${profile.first_name} ${profile.last_name}`.trim() || profile.username;

    // Kiểm tra xem có phải nhà tuyển dụng không (dựa vào profile hoặc user context)
    const isRecruiter = profile.role === "recruiter" || user?.role === "recruiter";

    // Hàm chuyển đổi role thô sang tên hiển thị thân thiện bằng tiếng Việt
    const getFriendlyRoleDisplay = (role?: string) => {
        if (!role) return "";
        switch (role.toLowerCase()) {
            case "student":
                return "Sinh viên / Ứng viên";
            case "recruiter":
                return "Nhà tuyển dụng";
            case "admin":
                return "Quản trị viên";
            default:
                return role;
        }
    };

    return (
        <div className="w-full lg:w-72 flex-shrink-0">
            <div className="flex flex-col items-center lg:items-start">
                <div className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-full overflow-hidden border border-border bg-surface-2 shadow-sm mb-4">
                    <SafeImage
                        src={profile.avatar_url || "/default-avatar.png"}
                        alt={fullName}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                <div className="w-full text-center lg:text-left mb-4">
                    <h1 className="text-2xl font-bold leading-tight text-text">{fullName}</h1>
                    <p className="text-lg text-muted font-light">{profile.username}</p>
                </div>

                {/* KHU VỰC NÚT HÀNH ĐỘNG: Hiển thị khác nhau tùy theo role */}
                <div className="w-full space-y-2 mb-6">
                    {!isRecruiter ? (
                        <button
                            onClick={onOpenUploadModal}
                            className="w-full py-2 px-3 bg-primary hover:opacity-90 text-on-primary rounded-md text-sm font-medium transition shadow-sm flex items-center justify-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>Tải lên CV để AI phân tích</span>
                        </button>
                    ) : (
                        <div className="w-full py-2 px-3 bg-surface-2 border border-border rounded-md text-sm font-medium text-center text-text">
                            💼 Tài khoản Quản lý tuyển dụng
                        </div>
                    )}
                </div>

                <div className="w-full space-y-2 text-sm text-muted">
                    {profile.email && <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{profile.email}</span>
                    </div>}


                    {profile.role && (
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium text-primary">
                                {getFriendlyRoleDisplay(profile.role)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}