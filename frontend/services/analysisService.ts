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

import { MOCK_ANALYSIS_DETAIL } from "@/mocks/analysisMockData";
import { AnalysisDetailData } from "@/types/analysis";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

let useMockData =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_USE_MOCK_DATA !== undefined
    ? process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
    : true;

export function isUsingMock(): boolean {
  return useMockData;
}

export function setUseMock(value: boolean): void {
  useMockData = value;
}

/**
 * Lấy dữ liệu chi tiết của một lượt phân tích CV & JD.
 * - Hiện tại: Trả về Mock Data với độ trễ mạng thực tế 250ms.
 * - Sau này: Gọi GET /api/analyses/:id/ từ Backend Django.
 */
export async function getAnalysisDetail(
  analysisId?: string
): Promise<AnalysisDetailData> {
  if (useMockData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_ANALYSIS_DETAIL);
      }, 250);
    });
  }

  const endpoint = analysisId
    ? `${API_BASE_URL}/api/analyses/${analysisId}/`
    : `${API_BASE_URL}/api/analyses/latest/`;

  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(
      `Lỗi kết nối máy chủ (${res.status}): Không thể tải chi tiết phân tích.`
    );
  }

  const data = (await res.json()) as AnalysisDetailData;
  return data;
}

/**
 * Gửi phản hồi xác nhận kỹ năng còn thiếu cho EduBot AI.
 * - Sau này: Gọi POST /api/analyses/:id/confirm-skill/
 */
export async function confirmSkillStatus(
  analysisId: string,
  skillId: string,
  level: "proficient" | "basic" | "unknown"
): Promise<{ success: boolean; message: string }> {
  if (useMockData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `Đã cập nhật trạng thái kỹ năng thành: ${level}`,
        });
      }, 200);
    });
  }

  const res = await fetch(
    `${API_BASE_URL}/api/analyses/${analysisId}/confirm-skill/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ skill_id: skillId, level }),
    }
  );

  if (!res.ok) {
    throw new Error("Không thể cập nhật trạng thái kỹ năng.");
  }

  return res.json();
}
