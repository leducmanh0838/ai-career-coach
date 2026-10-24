export interface RadarAxis {
  skill: string;
  candidateLevel: number; // 1 -> 5
  requiredLevel: number;  // 1 -> 5
}

export interface SkillGapItem {
  id: string;
  name: string;
  candidateLevel: number;
  requiredLevel: number;
  gapText: string;
  status: "met" | "minor_gap" | "major_gap";
}

export interface SkillVerificationItem {
  id: string;
  skillName: string;
  status: "pending" | "proficient" | "basic" | "unknown" | "skipped";
  badgeText: string;
}

export interface RoadmapResource {
  type: "video" | "doc" | "project";
  typeLabel: string;
  title: string;
  description: string;
  linkText: string;
  url?: string;
  actionText?: string;
}

export interface RoadmapNode {
  id: string;
  title: string;
  duration: string;
  status: "completed" | "active" | "locked" | "goal";
  resources?: RoadmapResource[];
}

export interface InterviewQuestionItem {
  id: string;
  seniority: "junior" | "middle" | "senior";
  category: string;
  tag: string;
  question: string;
  frequencyNote: string;
  userAnswer?: string;
  score?: number;
  assessment?: {
    strengths: string;
    improvements: string;
  };
}

export interface AnalysisDetailData {
  id: string;
  position: string;
  company: string;
  matchScore: number; // 0 - 100
  criteriaMet: string; // "6/9"
  roadmapDuration: string; // "~4 tuần"
  prospectRank: string; // "Rank A-"
  summaryNote: string;
  updatedAtText: string;
  radarAxes: RadarAxis[];
  skillGaps: SkillGapItem[];
  activeSkillPrompt: {
    skillName: string;
    description: string;
    details: string;
  };
  skillsToVerify: SkillVerificationItem[];
  roadmapNodes: RoadmapNode[];
  interviewQuestions: InterviewQuestionItem[];
}
