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
