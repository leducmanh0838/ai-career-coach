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
}

export const PAGE_SIZE = 7;
export const TOTAL_RECORDS = 18;

export const MOCK_HISTORY: AnalysisRecord[] = [
  {
    id: "1",
    date: "22/10/2026",
    time: "14:32",
    position: "Frontend Developer Intern",
    company: "Techcombank Digital Lab",
    category: "frontend",
    matchScore: 68,
  },
  {
    id: "2",
    date: "18/10/2026",
    time: "09:15",
    position: "Junior React Native Developer",
    company: "VNG Corporation",
    category: "mobile",
    matchScore: 82,
  },
  {
    id: "3",
    date: "12/10/2026",
    time: "16:40",
    position: "UI/UX Designer Trainee",
    company: "FPT Software",
    category: "design",
    matchScore: 45,
  },
  {
    id: "4",
    date: "05/10/2026",
    time: "11:05",
    position: "Fullstack Node.js / React Intern",
    company: "Viettel Digital",
    category: "fullstack",
    matchScore: 74,
  },
  {
    id: "5",
    date: "28/09/2026",
    time: "08:20",
    position: "Junior Frontend Web Engineer",
    company: "Shopee Vietnam",
    category: "frontend",
    matchScore: 88,
  },
  {
    id: "6",
    date: "19/09/2026",
    time: "20:10",
    position: "Backend Go/Java Fresher",
    company: "MoMo Payment",
    category: "backend",
    matchScore: 38,
  },
  {
    id: "7",
    date: "10/09/2026",
    time: "15:55",
    position: "Web Developer Trainee",
    company: "Tiki Corporation",
    category: "frontend",
    matchScore: 65,
  },
  {
    id: "8",
    date: "02/09/2026",
    time: "10:30",
    position: "Data Analyst Intern",
    company: "Grab Vietnam",
    category: "data",
    matchScore: 78,
  },
  {
    id: "9",
    date: "27/08/2026",
    time: "14:15",
    position: "DevOps Engineer Fresher",
    company: "Zalo Group",
    category: "devops",
    matchScore: 52,
  },
  {
    id: "10",
    date: "20/08/2026",
    time: "09:45",
    position: "AI / ML Engineer Trainee",
    company: "VinAI Research",
    category: "ai",
    matchScore: 91,
  },
  {
    id: "11",
    date: "14/08/2026",
    time: "17:00",
    position: "Junior QA/QC Automation",
    company: "KMS Technology",
    category: "qa",
    matchScore: 42,
  },
  {
    id: "12",
    date: "08/08/2026",
    time: "13:20",
    position: "Product Management Intern",
    company: "One Mount Group",
    category: "product",
    matchScore: 63,
  },
  {
    id: "13",
    date: "30/07/2026",
    time: "11:50",
    position: "iOS Swift Developer Fresher",
    company: "Garena Vietnam",
    category: "mobile",
    matchScore: 84,
  },
  {
    id: "14",
    date: "22/07/2026",
    time: "16:10",
    position: "Golang Microservices Intern",
    company: "Sendo Technology",
    category: "backend",
    matchScore: 71,
  },
  {
    id: "15",
    date: "15/07/2026",
    time: "10:05",
    position: "Vue.js Frontend Engineer",
    company: "Amanotes Vietnam",
    category: "frontend",
    matchScore: 48,
  },
  {
    id: "16",
    date: "09/07/2026",
    time: "14:40",
    position: "Cloud Infrastructure Intern",
    company: "FPT Telecom",
    category: "devops",
    matchScore: 80,
  },
  {
    id: "17",
    date: "01/07/2026",
    time: "08:35",
    position: "Product Designer Trainee",
    company: "Base.vn",
    category: "design",
    matchScore: 76,
  },
  {
    id: "18",
    date: "25/06/2026",
    time: "15:20",
    position: "Cybersecurity Analyst Trainee",
    company: "VNPT Cyber Security",
    category: "security",
    matchScore: 35,
  },
];
