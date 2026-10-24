import { AnalysisDetailData } from "@/types/analysis";

export const MOCK_ANALYSIS_DETAIL: AnalysisDetailData = {
  id: "rec-1",
  position: "Frontend Developer Intern",
  company: "Techcombank Digital Lab",
  matchScore: 68,
  criteriaMet: "6/9",
  roadmapDuration: "~4 tuần",
  prospectRank: "Rank A-",
  summaryNote: "Tiềm năng lớn, cần bù đắp 3 kỹ năng cốt lõi để đạt mức 90%+!",
  updatedAtText: "Cập nhật: 10 phút trước",

  radarAxes: [
    { skill: "JavaScript", candidateLevel: 3, requiredLevel: 4 },
    { skill: "React", candidateLevel: 2, requiredLevel: 4 },
    { skill: "HTML/CSS", candidateLevel: 4, requiredLevel: 4 },
    { skill: "Git", candidateLevel: 3, requiredLevel: 3 },
    { skill: "SQL", candidateLevel: 1, requiredLevel: 3 },
    { skill: "Giao tiếp", candidateLevel: 4, requiredLevel: 4 },
  ],

  skillGaps: [
    {
      id: "gap-1",
      name: "HTML5 & CSS3",
      candidateLevel: 4,
      requiredLevel: 4,
      gapText: "Đạt chuẩn",
      status: "met",
    },
    {
      id: "gap-2",
      name: "JavaScript (ES6+)",
      candidateLevel: 3,
      requiredLevel: 4,
      gapText: "Gap: -1 Level",
      status: "minor_gap",
    },
    {
      id: "gap-3",
      name: "ReactJS & State Management",
      candidateLevel: 2,
      requiredLevel: 4,
      gapText: "Gap: -2 Cần bổ sung gấp",
      status: "major_gap",
    },
    {
      id: "gap-4",
      name: "Git & GitHub Workflow",
      candidateLevel: 3,
      requiredLevel: 3,
      gapText: "Đạt chuẩn",
      status: "met",
    },
    {
      id: "gap-5",
      name: "SQL & API Integration",
      candidateLevel: 1,
      requiredLevel: 3,
      gapText: "Gap: -2 Thiếu hụt",
      status: "major_gap",
    },
    {
      id: "gap-6",
      name: "Kỹ năng Giao tiếp & Làm việc nhóm",
      candidateLevel: 4,
      requiredLevel: 4,
      gapText: "Đạt chuẩn",
      status: "met",
    },
  ],

  activeSkillPrompt: {
    skillName: "Docker",
    description:
      "Hệ thống AI nhận thấy JD tuyển dụng yêu cầu kỹ năng Docker nhưng chưa thấy trong CV của bạn. Bạn có kinh nghiệm với công nghệ này không?",
    details: "Docker (Containerization & Deployment cơ bản)",
  },

  skillsToVerify: [
    {
      id: "verify-1",
      skillName: "Docker",
      status: "pending",
      badgeText: "Đang chọn",
    },
    {
      id: "verify-2",
      skillName: "TypeScript",
      status: "basic",
      badgeText: "Biết cơ bản",
    },
    {
      id: "verify-3",
      skillName: "RESTful API",
      status: "proficient",
      badgeText: "Thành thạo",
    },
    {
      id: "verify-4",
      skillName: "Tailwind CSS",
      status: "unknown",
      badgeText: "Chờ xác nhận",
    },
    {
      id: "verify-5",
      skillName: "CI/CD basics",
      status: "skipped",
      badgeText: "Bỏ qua",
    },
  ],

  roadmapNodes: [
    {
      id: "node-1",
      title: "Củng cố JavaScript ES6+ & Async",
      duration: "1-2 tuần • Đã xong",
      status: "completed",
    },
    {
      id: "node-2",
      title: "React Hooks & State Management",
      duration: "2-3 tuần • Đang học",
      status: "active",
      resources: [
        {
          type: "video",
          typeLabel: "Video Course",
          title: "Khóa học F8: ReactJS từ cơ bản đến nâng cao",
          description:
            "Giáo trình tiếng Việt thực chiến, tập trung sâu useState, useEffect, useReducer.",
          linkText: "Học miễn phí",
          url: "https://fullstack.edu.vn",
        },
        {
          type: "doc",
          typeLabel: "Tài liệu chính thức",
          title: "Official React Docs: Reusing Logic with Custom Hooks",
          description:
            "Đọc trong 45 phút, giải quyết hoàn toàn tư duy tái sử dụng logic giao diện.",
          linkText: "Xem tài liệu",
          url: "https://react.dev",
        },
        {
          type: "project",
          typeLabel: "Thực hành áp dụng",
          title: "Mini Project: Todo & Note App",
          description:
            "Tích hợp LocalStorage & Context API. Yêu cầu clean code không re-render thừa.",
          linkText: "Bắt đầu bài tập",
          actionText: "Bắt đầu bài tập",
        },
      ],
    },
    {
      id: "node-3",
      title: "Next.js & SSR cơ bản",
      duration: "Ước tính: 2 tuần",
      status: "locked",
    },
    {
      id: "node-4",
      title: "Docker cho Frontend",
      duration: "Ước tính: 1 tuần",
      status: "locked",
    },
    {
      id: "node-goal",
      title: "100% Target",
      duration: "Tự tin ứng tuyển",
      status: "goal",
    },
  ],

  interviewQuestions: [
    {
      id: "q-1",
      seniority: "junior",
      category: "JavaScript Core",
      tag: "Cơ bản - Thường gặp",
      question:
        "Giải thích sự khác biệt giữa Event Loop, Microtask và Macrotask trong JavaScript? Cho ví dụ thực tế khi sử dụng Promise vs setTimeout.",
      frequencyNote: "Tần suất xuất hiện: 94% các buổi phỏng vấn vị trí Intern/Junior Frontend.",
      userAnswer:
        "Em hiểu Event loop quản lý hàng đợi thực thi giữa Call Stack và các Task Queue. Promise (.then) thuộc hàng đợi microtask nên sẽ luôn được ưu tiên chạy trước các macrotask như setTimeout, dù setTimeout có set thời gian là 0ms.",
      score: 8.5,
      assessment: {
        strengths:
          "Nắm vững bản chất thứ tự ưu tiên giữa Promise microtask và setTimeout macrotask. Trình bày rành mạch, súc tích đúng trọng tâm câu hỏi.",
        improvements:
          "Nên bổ sung thêm vai trò của Render Queue (requestAnimationFrame) và cảnh báo về hiện tượng UI bị treo đơ nếu lạm dụng microtask đệ quy (Microtask Starvation).",
      },
    },
    {
      id: "q-2",
      seniority: "junior",
      category: "ReactJS",
      tag: "Quan trọng",
      question:
        'Tại sao không nên mutate trực tiếp state trong React? "useMemo" và "useCallback" khác nhau như thế nào và khi nào thì không nên lạm dụng?',
      frequencyNote: "Tần suất xuất hiện: 94% các buổi phỏng vấn vị trí Intern/Junior Frontend.",
    },
    {
      id: "q-3",
      seniority: "middle",
      category: "Web Performance",
      tag: "Nâng cao",
      question:
        "Làm thế nào để tối ưu các chỉ số Core Web Vitals (LCP, FID/INP, CLS) cho một ứng dụng Single Page Application (SPA)?",
      frequencyNote: "Thước đo điểm cộng phân hóa ứng viên xuất sắc trong vòng kỹ thuật.",
    },
    {
      id: "q-4",
      seniority: "junior",
      category: "Kỹ năng mềm & Tình huống",
      tag: "Tình huống thực tế",
      question:
        "Khi gặp một bug nghiêm trọng trên môi trường staging trước giờ release sản phẩm 30 phút, bạn sẽ xử lý và trao đổi với Tech Lead như thế nào?",
      frequencyNote: "Kiểm tra tính trung thực, bình tĩnh và kỹ năng báo cáo xử lý khủng hoảng.",
    },
  ],
};
