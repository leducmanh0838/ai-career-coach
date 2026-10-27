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

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import { useCV } from "@/context/CVContext";
import SkillModal from "../../../components/skill/SkillModal";
import {
  Cpu,
  BrainCircuit,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { getLevelBadgeConfig } from "../_types";

function AnalyzeCVPage() {
  const { selectedFile } = useCV();

  const [useMock] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(10);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // State quản lý danh sách StudentSkills thực tế từ DB (Nguồn dữ liệu chính cho UI)
  const [studentSkills, setStudentSkills] = useState<any[]>([]);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState<boolean>(false);
  const [editingSkill, setEditingSkill] = useState<any | null>(null);

  const fetchStudentSkills = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${baseUrl}/api/me/skills/`, {
        credentials: "include",
      });
      if (res.ok) {
        const data: any = await res.json();
        setStudentSkills(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách kỹ năng sinh viên:", err);
    }
  };

  useEffect(() => {
    if (!selectedFile) return;
    startStreamingAnalysis(selectedFile);
    fetchStudentSkills();
  }, [selectedFile]);

  const startStreamingAnalysis = async (file: File) => {
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

    const formData = new FormData();
    formData.append("pdf_file", file);
    formData.append("use_mock", useMock ? "true" : "false");
    formData.append("skill_top_k", "5");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

      const res = await fetch(`${cleanBaseUrl}/api/ai/analyze-stream`, {
        method: "POST",
        body: formData,
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
                fetchStudentSkills();
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
    const existingRecord = studentSkills.find(
      (s) => s.id === item.id || s.skill?.id === item.skill_id || s.skill === item.skill_id
    );

    if (existingRecord) {
      setEditingSkill(existingRecord);
    } else {
      setEditingSkill({
        id: item.id || null,
        skill: { id: item.skill_id, name: item.skill_name || item.source_name },
        level: item.level,
      });
    }
    setIsSkillModalOpen(true);
  };

  const handleDeleteSkill = async (item: any) => {
    const existingRecord = studentSkills.find(
      (s) => s.id === item.id || s.skill?.id === item.skill_id || s.skill === item.skill_id
    );

    if (!existingRecord) {
      alert("Không tìm thấy kỹ năng này trong cơ sở dữ liệu để xóa.");
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa kỹ năng "${item.skill_name || item.source_name}" khỏi hồ sơ không?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

      const res = await fetch(`${cleanBaseUrl}/api/me/skills/${existingRecord.id}/`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Không thể xóa kỹ năng.");

      fetchStudentSkills();
    } catch (err: any) {
      alert(err.message || "Lỗi khi xóa kỹ năng.");
    }
  };

  if (!selectedFile && !analysisResult && !isAnalyzing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-bg text-muted">
        <div className="p-4 bg-amber-50 rounded-full text-amber-600 mb-4 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-text">Chưa có file CV nào được chọn!</h2>
        <p className="text-sm text-muted mb-6">Vui lòng quay lại trang Profile và chọn file CV để bắt đầu khám phá nhé.</p>
        <Link href="/profile" className="px-5 py-2.5 bg-primary hover:opacity-90 text-on-primary rounded-sm text-sm font-medium transition shadow-sm">
          Quay lại Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-text">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              Trợ lý AI Đang Phân tích Hồ sơ
            </h1>
            <p className="text-sm text-muted mt-1">Đang xử lý tệp: <span className="font-semibold text-primary">{selectedFile?.name}</span></p>
          </div>
          <Link href="/profile" className="px-4 py-2 text-sm font-medium bg-surface border border-border hover:bg-surface-2 rounded-sm shadow-sm transition text-text">
            Quay lại Profile
          </Link>
        </div>

        {isAnalyzing && (
          <div className="bg-surface border border-border rounded-lg p-8 shadow-sm backdrop-blur-md space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-muted uppercase tracking-wider">
                <span>Đang phân tích hồ sơ...</span>
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

        {analysisResult && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 bg-primary-soft border border-border rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary text-on-primary rounded-lg flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text">Phân tích CV hoàn tất! 🎉</h3>
                  <p className="text-xs text-muted mt-0.5">{analysisResult.message || "Hệ thống đã trích xuất toàn bộ dữ liệu thành công."}</p>
                </div>
              </div>
              <Link href="/profile" className="px-5 py-2.5 text-xs font-semibold bg-primary hover:opacity-90 text-on-primary rounded-sm shadow-sm transition whitespace-nowrap">
                Về trang Profile ngay
              </Link>
            </div>

            {analysisResult.data?.extracted_occupations && analysisResult.data.extracted_occupations.length > 0 && (
              <div className="bg-surface border border-border rounded-lg p-6 shadow-sm space-y-3">
                <h2 className="text-base font-bold flex items-center gap-2 text-text">
                  <Cpu className="w-5 h-5 text-primary" />
                  Vị trí công việc định hướng phù hợp
                </h2>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.data.extracted_occupations.map((occ: string, idx: number) => (
                    <span key={idx} className="px-3.5 py-1.5 bg-primary-soft text-primary text-xs font-semibold rounded-full border border-border shadow-2xs">
                      {occ}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* DANH SÁCH KỸ NĂNG: LẤY TRỰC TIẾP TỪ studentSkills (LUÔN ĐỒNG BỘ MỚI NHẤT TỪ DB) */}
            <div className="bg-surface border border-border rounded-lg p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2 text-text">
                  <BrainCircuit className="w-5 h-5 text-primary" />
                  Danh sách kỹ năng đã trích xuất & đánh giá
                </h2>
                <button
                  onClick={handleOpenAddSkill}
                  className="px-3 py-1.5 text-xs font-medium bg-primary hover:opacity-90 text-on-primary rounded-sm transition shadow-sm"
                >
                  + Thêm kỹ năng
                </button>
              </div>

              {(() => {
                // Ưu tiên dùng studentSkills từ DB, nếu chưa có thì fallback về AI analysisResult
                const skillsList = studentSkills.length > 0
                  ? studentSkills.map(s => ({
                    id: s.id,
                    skill_id: s.skill?.id || s.skill,
                    skill_name: s.skill?.name_vi || s.skill?.name || "Kỹ năng",
                    source_name: s.skill?.name,
                    level: s.level,
                    reasoning: s.reasoning,
                    evidence: s.evidence || []
                  }))
                  : (analysisResult.data?.skills || analysisResult.skills || analysisResult.result?.skills || []);

                if (skillsList.length === 0) {
                  return (
                    <div className="space-y-3 py-6 text-center">
                      <p className="text-sm text-muted font-medium">Không tìm thấy kỹ năng nào trong kết quả.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 gap-4">
                    {skillsList.map((item: any, idx: number) => {
                      const badge = getLevelBadgeConfig(item.level);

                      return (
                        <div key={item.id || idx} className="p-5 rounded-lg border border-border bg-surface-2 hover:border-primary transition-all space-y-3 shadow-2xs">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="font-bold text-base text-text flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-primary"></span>
                              {item.skill_name || item.source_name}
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
                              <span className="font-semibold text-text">🤖 AI Nhận xét: </span>
                              {item.reasoning}
                            </p>
                          )}

                          {item.evidence && item.evidence.length > 0 && (
                            <div className="text-xs text-muted bg-surface p-3 rounded-sm border border-border space-y-1">
                              <span className="font-semibold block text-text flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                Minh chứng trích xuất từ CV:
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
                );
              })()}
            </div>
          </div>
        )}

      </div>

      {/* Modal Thêm / Sửa kỹ năng dùng chung */}
      <SkillModal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        onSuccess={() => {
          // Gọi lại API tải danh sách kỹ năng mới nhất từ DB, UI tự động cập nhật ngay lập tức!
          fetchStudentSkills();
        }}
        editingSkill={editingSkill}
      />
    </div>
  );
}

export default memo(AnalyzeCVPage);