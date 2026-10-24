import type { Metadata } from "next";
import HistoryPageClient from "../component/history/HistoryPageClient";

export const metadata: Metadata = {
  title: "Lịch sử phân tích | AI Career Coach",
  description:
    "Xem lại các lần phân tích CV trước đây của bạn, theo dõi mức độ đáp ứng năng lực và cải thiện hồ sơ ứng tuyển theo thời gian.",
};

export default function HistoryPage() {
  return <HistoryPageClient />;
}
