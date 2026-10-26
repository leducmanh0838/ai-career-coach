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
      className: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  switch (level.toLowerCase()) {
    case "foundation":
      return { label: "Nền tảng", className: "bg-surface-2 text-muted border-border" };
    case "applied":
      return { label: "Thực hành", className: "bg-primary-soft text-primary border-border" };
    case "proficient":
      return { label: "Thành thạo", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case "advanced":
      return { label: "Nâng cao", className: "bg-purple-50 text-purple-700 border-purple-200" };
    default:
      return { label: level, className: "bg-surface-2 text-muted border-border" };
  }
};