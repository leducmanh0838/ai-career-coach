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

export interface SkillDetail {
  id: string;
  name: string;
  name_vi: string;
  skill_type: string;
  description_vi: string;
}

export interface StudentSkill {
  id: number;
  skill: SkillDetail;
  level: string | null;
  reasoning: string;
  evidence: string[];
  status: string;
}

export interface StudentProfile {
  id: number;
  profile_summary: string;
  extracted_occupations: string[];
  updated_at: string;
  student_skills: StudentSkill[];
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number: string | null;
  avatar_url: string;
  student_profile: StudentProfile | null;
}

export const getLevelBadgeConfig = (level: string | null | undefined) => {
  if (!level) {
    return {
      label: "⚠️ Chưa đánh giá",
      // Dùng tông màu đỏ/hồng cảnh báo (rose) để tạo sự chú ý mạnh, kết hợp font đậm và bóng nhẹ
      className: "bg-rose-50 text-rose-700 border-rose-300 font-semibold shadow-sm",
    };
  }

  switch (String(level).toLowerCase()) {
    case "1":
    case "foundation":
      // Cấp 1: Nền tảng (Sắc Xám/Slate trung tính)
      return { label: "1/4 Nền tảng", className: "bg-slate-100 text-slate-700 border-slate-200" };

    case "2":
    case "applied":
      // Cấp 2: Thực hành (Sắc Xanh dương/Blue)
      return { label: "2/4 Thực hành", className: "bg-blue-50 text-blue-700 border-blue-200" };

    case "3":
    case "proficient":
      // Cấp 3: Thành thạo (Sắc Xanh ngọc/Teal)
      return { label: "3/4 Thành thạo", className: "bg-teal-50 text-teal-700 border-teal-200" };

    case "4":
    case "advanced":
      // Cấp 4: Nâng cao (Sắc Vàng đồng/Amber)
      return { label: "4/4 Nâng cao", className: "bg-amber-50 text-amber-800 border-amber-300 font-semibold" };

    default:
      return { label: String(level), className: "bg-slate-100 text-slate-700 border-slate-200" };
  }
};