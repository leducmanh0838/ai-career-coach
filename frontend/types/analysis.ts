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
