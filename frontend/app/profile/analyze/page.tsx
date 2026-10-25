"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCV } from "@/context/CVContext";
import SkillModal from "../_components/SkillModal";
import {
  FileText,
  Cpu,
  BrainCircuit,
  CheckCircle2,
  Loader2,
  Sparkles,
  ShieldCheck,
  Check,
  AlertCircle,
  Activity,
  FileSearch,
  Target
} from "lucide-react";

interface BackendSkillItem {
  source_name: string;
  skill_id: string;
  skill_name: string;
  level: string | null;
  evidence: string[];
  confidence: number;
  reasoning: string;
  status: string;
}

const ANALYSIS_STEPS = [
  { id: "init", label: "Tải tệp & Khởi tạo", icon: FileText },
  { id: "extract", label: "Đọc hiểu nội dung CV", icon: FileSearch },
  { id: "occupations", label: "Định hướng nghề nghiệp", icon: Target },
  { id: "skills", label: "Đánh giá chuyên sâu kỹ năng", icon: BrainCircuit },
  { id: "completed", label: "Hoàn tất hồ sơ", icon: CheckCircle2 },
];

export default function AnalyzeCVPage() {
  const { selectedFile } = useCV();

  const [useMock] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentStepKey, setCurrentStepKey] = useState<string>("init");
  const [currentStepText, setCurrentStepText] = useState<string>("Đang chuẩn bị hệ thống AI...");
  const [progressPercent, setProgressPercent] = useState<number>(10);
  const [friendlyLogs, setFriendlyLogs] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // State quản lý danh sách StudentSkills thực tế từ DB để lấy ID khi Sửa/Xóa
  const [studentSkills, setStudentSkills] = useState<any[]>([]);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState<boolean>(false);
  const [editingSkill, setEditingSkill] = useState<any | null>(null);

  const fetchStudentSkills = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
      const res = await fetch(`${cleanBaseUrl}/api/me/skills/`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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

  const getLevelBadgeConfig = (level: string | null | undefined) => {
    if (!level) return { label: "Chưa đánh giá", className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400" };
    switch (level.toLowerCase()) {
      case "foundation": return { label: "Nền tảng", className: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-zinc-800 dark:text-gray-300" };
      case "applied": return { label: "Thực hành", className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400" };
      case "proficient": return { label: "Thành thạo", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400" };
      case "advanced": return { label: "Nâng cao", className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400" };
      default: return { label: level, className: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-zinc-800 dark:text-gray-400" };
    }
  };

  useEffect(() => {
    if (!selectedFile) return;
    startStreamingAnalysis(selectedFile);
    fetchStudentSkills();
  }, [selectedFile]);

  const translateStepToFriendlyText = (rawStep: string) => {
    const lower = rawStep.toLowerCase();
    if (lower.includes("init")) return "Đang thiết lập kết nối an toàn với trợ lý AI...";
    if (lower.includes("cv_text") || lower.includes("extract")) return "Đang rà soát và đọc hiểu từng phần trong bản CV của bạn...";
    if (lower.includes("fact") || lower.includes("data")) return "Đang tổng hợp thông tin học vấn, dự án và kinh nghiệm...";
    if (lower.includes("occupation") || lower.includes("vị trí")) return "Đang phân tích các vị trí công việc phù hợp với năng lực...";
    if (lower.includes("skill") || lower.includes("derived") || lower.includes("chấm điểm")) return "Đang phân tích chuyên sâu và đánh giá mức độ thành thạo kỹ năng...";
    if (lower.includes("complete") || lower.includes("success")) return "Đã phân tích xong! Đang tổng hợp kết quả cho bạn...";
    return rawStep;
  };

  const mapStepKey = (stepMsg: string) => {
    const lower = stepMsg.toLowerCase();
    if (lower.includes("extract") || lower.includes("cv_text") || lower.includes("đọc")) return "extract";
    if (lower.includes("occupation") || lower.includes("fact") || lower.includes("nghề nghiệp")) return "occupations";
    if (lower.includes("skill") || lower.includes("derived") || lower.includes("kỹ năng")) return "skills";
    if (lower.includes("complete") || lower.includes("success")) return "completed";
    return "init";
  };

  const startStreamingAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setProgressPercent(15);
    setCurrentStepKey("init");

    const initialMsg = "Đang tải tệp CV lên hệ thống phân tích...";
    setCurrentStepText(initialMsg);
    setFriendlyLogs([initialMsg]);

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

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonString = line.replace("data: ", "").trim();
            try {
              const eventData = JSON.parse(jsonString);

              if (eventData.step) {
                const friendlyText = translateStepToFriendlyText(eventData.step);
                setCurrentStepText(friendlyText);
                setCurrentStepKey(mapStepKey(eventData.step));
                setFriendlyLogs((prev) => [...prev, friendlyText]);
              }
              if (eventData.progress) {
                setProgressPercent(eventData.progress);
              }

              if (
                eventData.status === "SUCCESS" ||
                eventData.data?.skills ||
                eventData.skills ||
                eventData.result?.skills
              ) {
                setCurrentStepKey("completed");
                setCurrentStepText("Phân tích hoàn tất thành công!");
                setAnalysisResult(eventData);
                setProgressPercent(100);
                fetchStudentSkills();
              }

              if (eventData.status === "FAILED" || eventData.error) {
                throw new Error(eventData.error || "Quá trình phân tích gặp lỗi.");
              }
            } catch (parseErr) {
              console.error("Parse JSON error:", parseErr);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi không xác định.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Xử lý Thêm / Sửa / Xóa kỹ năng trên trang phân tích
  const handleOpenAddSkill = () => {
    setEditingSkill(null);
    setIsSkillModalOpen(true);
  };

  const handleOpenEditSkill = (item: BackendSkillItem) => {
    // Tìm xem kỹ năng này đã có bản ghi StudentSkill trong DB chưa
    const existingRecord = studentSkills.find((s) => s.skill?.id === item.skill_id);
    if (existingRecord) {
      setEditingSkill(existingRecord);
    } else {
      setEditingSkill({
        id: null,
        skill: { id: item.skill_id, name: item.skill_name },
        level: item.level,
      });
    }
    setIsSkillModalOpen(true);
  };

  const handleDeleteSkill = async (item: BackendSkillItem) => {
    const existingRecord = studentSkills.find((s) => s.skill?.id === item.skill_id);
    if (!existingRecord) {
      // Nếu chưa lưu vào DB, chỉ xóa khỏi state hiển thị
      setAnalysisResult((prev: any) => {
        if (!prev) return prev;
        const skills = prev.data?.skills || prev.skills || prev.result?.skills || [];
        const updated = skills.filter((s: any) => s.skill_id !== item.skill_id);
        return {
          ...prev,
          data: prev.data ? { ...prev.data, skills: updated } : prev.data,
          skills: prev.skills ? updated : prev.skills,
        };
      });
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

      // Xóa khỏi state hiển thị và cập nhật lại danh sách student skills
      setAnalysisResult((prev: any) => {
        if (!prev) return prev;
        const skills = prev.data?.skills || prev.skills || prev.result?.skills || [];
        const updated = skills.filter((s: any) => s.skill_id !== item.skill_id);
        return {
          ...prev,
          data: prev.data ? { ...prev.data, skills: updated } : prev.data,
          skills: prev.skills ? updated : prev.skills,
        };
      });
      fetchStudentSkills();
    } catch (err: any) {
      alert(err.message || "Lỗi khi xóa kỹ năng.");
    }
  };

  if (!selectedFile && !analysisResult && !isAnalyzing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-zinc-900">
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-full text-amber-600 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">Chưa có file CV nào được chọn!</h2>
        <p className="text-sm text-gray-500 mb-6">Vui lòng quay lại trang Profile và chọn file CV để bắt đầu khám phá nhé.</p>
        <Link href="/profile" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm">
          Quay lại Profile
        </Link>
      </div>
    );
  }

  const getStepStatus = (stepId: string) => {
    const order = ["init", "extract", "occupations", "skills", "completed"];
    const currentIndex = order.indexOf(currentStepKey);
    const stepIndex = order.indexOf(stepId);

    if (analysisResult || currentStepKey === "completed") return "completed";
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  return (
    <div className="min-h-screen bg-gray-50/70 dark:bg-zinc-900 text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
              Trợ lý AI Đang Phân tích Hồ sơ
            </h1>
            <p className="text-sm text-gray-500 mt-1">Đang xử lý tệp: <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedFile?.name}</span></p>
          </div>
          <Link href="/profile" className="px-4 py-2 text-sm font-medium bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 rounded-lg shadow-sm transition">
            Quay lại Profile
          </Link>
        </div>

        {isAnalyzing && (
          <div className="bg-white dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl backdrop-blur-md space-y-8">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <span>Tiến độ xử lý</span>
                <span className="text-blue-600 dark:text-blue-400">{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-zinc-700/60 rounded-full h-3.5 overflow-hidden p-0.5 border border-gray-200 dark:border-zinc-700">
                <div
                  className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 h-full rounded-full transition-all duration-500 ease-out relative shadow-inner"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-0 bg-white/25 animate-[shimmer_2s_infinite] rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
              {ANALYSIS_STEPS.map((step) => {
                const status = getStepStatus(step.id);
                const IconComponent = step.icon;

                let badgeStyles = "border-gray-200 bg-gray-50 text-gray-400 dark:border-zinc-700 dark:bg-zinc-900/40";
                let iconColor = "text-gray-400";

                if (status === "completed") {
                  badgeStyles = "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shadow-sm";
                  iconColor = "text-emerald-600 dark:text-emerald-400";
                } else if (status === "current") {
                  badgeStyles = "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-md ring-4 ring-blue-500/10 animate-pulse";
                  iconColor = "text-blue-600 dark:text-blue-400 animate-bounce";
                }

                return (
                  <div key={step.id} className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-300 ${badgeStyles}`}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-800 shadow-sm mb-2">
                      {status === "completed" ? (
                        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : status === "current" ? (
                        <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                      ) : (
                        <IconComponent className={`w-5 h-5 ${iconColor}`} />
                      )}
                    </div>
                    <span className="text-xs font-medium leading-tight line-clamp-2">{step.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center space-x-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 p-4 rounded-2xl">
              <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md animate-spin flex-shrink-0">
                <Loader2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">AI đang thực hiện</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">{currentStepText}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                <Activity className="w-4 h-4 text-indigo-500" />
                <span>Nhật ký hoạt động của Trợ lý AI:</span>
              </div>
              <div className="bg-gray-50 dark:bg-zinc-900/80 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-2 max-h-36 overflow-y-auto">
                {friendlyLogs.map((logMsg, index) => (
                  <div key={index} className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-300 animate-fadeIn">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                    <span className="leading-relaxed">{logMsg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/55 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {analysisResult && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300">Phân tích CV hoàn tất! 🎉</h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">{analysisResult.message || "Hệ thống đã trích xuất toàn bộ dữ liệu thành công."}</p>
                </div>
              </div>
              <Link href="/profile" className="px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition whitespace-nowrap">
                Về trang Profile ngay
              </Link>
            </div>

            {analysisResult.data?.extracted_occupations && analysisResult.data.extracted_occupations.length > 0 && (
              <div className="bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
                <h2 className="text-base font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  Vị trí công việc định hướng phù hợp
                </h2>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.data.extracted_occupations.map((occ: string, idx: number) => (
                    <span key={idx} className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-800/80 shadow-xs">
                      {occ}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* DANH SÁCH KỸ NĂNG VỚI NÚT THÊM, SỬA, XÓA */}
            <div className="bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                  Danh sách kỹ năng đã trích xuất & đánh giá
                </h2>
                <button
                  onClick={handleOpenAddSkill}
                  className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm"
                >
                  + Thêm kỹ năng
                </button>
              </div>

              {(() => {
                const skillsList: BackendSkillItem[] =
                  analysisResult.data?.skills ||
                  analysisResult.skills ||
                  analysisResult.result?.skills ||
                  [];

                if (skillsList.length === 0) {
                  return (
                    <div className="space-y-3 py-6 text-center">
                      <p className="text-sm text-gray-500 font-medium">Không tìm thấy kỹ năng nào trong kết quả.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 gap-4">
                    {skillsList.map((item, idx) => {
                      const badge = getLevelBadgeConfig(item.level);

                      return (
                        <div key={idx} className="p-5 rounded-xl border border-gray-100 dark:border-zinc-700/80 bg-gray-50/60 dark:bg-zinc-900/40 hover:border-blue-200 dark:hover:border-zinc-600 transition-all space-y-3 shadow-xs">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                              {item.skill_name || item.source_name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 text-xs font-semibold border rounded-full shadow-2xs ${badge.className}`}>
                                {badge.label}
                              </span>
                              <button
                                onClick={() => handleOpenEditSkill(item)}
                                className="px-2.5 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-md transition"
                                title="Chỉnh sửa mức độ kỹ năng"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteSkill(item)}
                                className="px-2 py-1 text-xs font-medium bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-md transition"
                                title="Xóa kỹ năng"
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          {item.reasoning && (
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-white dark:bg-zinc-800/80 p-3 rounded-lg border border-gray-200/60 dark:border-zinc-700/60">
                              <span className="font-semibold text-gray-700 dark:text-gray-200">🤖 AI Nhận xét: </span>
                              {item.reasoning}
                            </p>
                          )}

                          {item.evidence && item.evidence.length > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-zinc-800 p-3 rounded-lg border border-gray-200 dark:border-zinc-700 space-y-1">
                              <span className="font-semibold block text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                Minh chứng trích xuất từ CV:
                              </span>
                              <ul className="list-disc list-inside space-y-1 italic pl-1">
                                {item.evidence.map((ev, eIdx) => (
                                  <li key={eIdx} className="text-gray-600 dark:text-gray-300">&ldquo;{ev}&rdquo;</li>
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
          fetchStudentSkills();
        }}
        editingSkill={editingSkill}
      />
    </div>
  );
}