export type JobCategory =
  | "frontend"
  | "mobile"
  | "design"
  | "backend"
  | "fullstack"
  | "data"
  | "devops"
  | "ai"
  | "qa"
  | "product"
  | "security"
  | "other";

export interface AnalysisRecord {
  id: string;
  date: string;
  time: string;
  position: string;
  company: string;
  category: JobCategory;
  matchScore: number; // 0 - 100
  reportUrl?: string;
  downloadUrl?: string;
}

export type ScoreRangeFilter = "all" | "optimal" | "promising" | "gap";

export interface HistoryQueryParams {
  page: number; // 1-indexed
  pageSize: number;
  search?: string; // Search query: position, company, date
  category?: JobCategory | "all";
  scoreRange?: ScoreRangeFilter;
}

export interface HistoryApiResponse {
  records: AnalysisRecord[];
  total: number;
  page: number;
  pageSize: number;
}
