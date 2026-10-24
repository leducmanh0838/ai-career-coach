import type { Metadata } from "next";
import AnalysisPageClient from "@/components/analysis/AnalysisPageClient";

export const metadata: Metadata = {
  title: "Báo cáo Phân tích Năng lực & Đánh giá CV | AI Career Coach",
  description:
    "Đánh giá năng lực dựa trên JD mục tiêu và hồ sơ cá nhân, phân tích độ hẫng kỹ năng (Skill Gap), lộ trình học tập và bộ câu hỏi phỏng vấn thông minh.",
};

interface AnalysisPageProps {
  searchParams?: Promise<{ id?: string }> | { id?: string };
}

export default async function AnalysisPage({ searchParams }: AnalysisPageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const analysisId = resolvedParams?.id;

  return <AnalysisPageClient analysisId={analysisId} />;
}
