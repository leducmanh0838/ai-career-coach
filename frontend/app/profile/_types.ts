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
      label: "Chưa đánh giá",
      className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
    };
  }

  switch (level.toLowerCase()) {
    case "foundation":
      return { label: "Nền tảng", className: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700" };
    case "applied":
      return { label: "Thực hành", className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800" };
    case "proficient":
      return { label: "Thành thạo", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800" };
    case "advanced":
      return { label: "Nâng cao", className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-800" };
    default:
      return { label: level, className: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-700" };
  }
};