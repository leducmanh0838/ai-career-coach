import { MOCK_HISTORY, PAGE_SIZE } from "@/mocks/historyMockData";
import {
  AnalysisRecord,
  JobCategory,
  ScoreRangeFilter,
  HistoryQueryParams,
  HistoryApiResponse,
} from "@/types/history";

export type { ScoreRangeFilter, HistoryQueryParams, HistoryApiResponse };

// ─────────────────────────────────────────────────────────
// CẤU HÌNH LINK API & CHẾ ĐỘ DỮ LIỆU
// ─────────────────────────────────────────────────────────

/**
 * 📍 BƯỚC 1: Cấu hình link API backend
 * Mặc định lấy từ biến môi trường NEXT_PUBLIC_API_URL trong file .env (ví dụ: http://localhost:8001)
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

/**
 * 📍 BƯỚC 2: Đường dẫn API lấy lịch sử phân tích
 * Nếu backend của bạn đặt endpoint khác, bạn chỉ cần thay đổi đường dẫn tại đây:
 */
export const HISTORY_API_ENDPOINT = `${API_BASE_URL}/api/analyses/history`;

/**
 * 📍 BƯỚC 3: Cờ bật/tắt Mock Data
 * - true  : Dùng dữ liệu mẫu (mock) để test giao diện offline.
 * - false : Gọi API thật tới HISTORY_API_ENDPOINT ở trên.
 *
 * Mẹo: Bạn có thể đổi dòng này thành `false`, hoặc đặt
 * `NEXT_PUBLIC_USE_MOCK_DATA="false"` trong file .env.
 */
let useMockData =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_USE_MOCK_DATA !== undefined
    ? process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
    : true; // ← ĐỔI THÀNH false KHI BẮT ĐẦU DÙNG API THẬT

/**
 * Kiểm tra xem service có đang ở chế độ mock hay không
 */
export function isUsingMock(): boolean {
  return useMockData;
}

/**
 * Hàm hỗ trợ đổi chế độ nhanh lúc runtime (phục vụ dev/test)
 */
export function setUseMock(value: boolean): void {
  useMockData = value;
}

// ─────────────────────────────────────────────────────────
// Mock Data Source (Offline / Development)
// ─────────────────────────────────────────────────────────

function fetchMockHistory(params: HistoryQueryParams): Promise<HistoryApiResponse> {
  return new Promise((resolve) => {
    // Giả lập độ trễ mạng thực tế (250ms)
    setTimeout(() => {
      let filtered = [...MOCK_HISTORY];

      // Tìm kiếm text: vị trí, công ty hoặc ngày
      const q = (params.search ?? "").trim().toLowerCase();
      if (q) {
        filtered = filtered.filter(
          (item) =>
            item.position.toLowerCase().includes(q) ||
            item.company.toLowerCase().includes(q) ||
            item.date.includes(q)
        );
      }

      // Bộ lọc danh mục
      if (params.category && params.category !== "all") {
        filtered = filtered.filter((item) => item.category === params.category);
      }

      // Bộ lọc khoảng điểm
      if (params.scoreRange === "optimal") {
        filtered = filtered.filter((item) => item.matchScore >= 80);
      } else if (params.scoreRange === "promising") {
        filtered = filtered.filter(
          (item) => item.matchScore >= 50 && item.matchScore < 80
        );
      } else if (params.scoreRange === "gap") {
        filtered = filtered.filter((item) => item.matchScore < 50);
      }

      const total = filtered.length;
      const start = (params.page - 1) * params.pageSize;
      const records = filtered.slice(start, start + params.pageSize);

      resolve({
        records,
        total,
        page: params.page,
        pageSize: params.pageSize,
      });
    }, 250);
  });
}

// ─────────────────────────────────────────────────────────
// Real API Source (Production / Backend Integration)
// ─────────────────────────────────────────────────────────

async function fetchRealHistory(
  params: HistoryQueryParams
): Promise<HistoryApiResponse> {
  // Chuẩn bị URL Query Parameters gửi lên backend
  const query = new URLSearchParams({
    page: String(params.page),
    page_size: String(params.pageSize),
  });

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.category && params.category !== "all") {
    query.set("category", params.category);
  }

  if (params.scoreRange && params.scoreRange !== "all") {
    query.set("score_range", params.scoreRange);
  }

  const fullUrl = `${HISTORY_API_ENDPOINT}?${query.toString()}`;

  const res = await fetch(fullUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include", // Tự động gửi cookie session/JWT đăng nhập nếu có
  });

  if (!res.ok) {
    throw new Error(
      `Lỗi kết nối máy chủ (${res.status}): Không thể tải lịch sử phân tích.`
    );
  }

  const data = await res.json();

  // Adapter: Xử lý linh hoạt format của Django REST Framework hoặc custom API
  const rawList: any[] = data.results ?? data.records ?? data.data ?? [];
  const records: AnalysisRecord[] = rawList.map((item: any, idx: number) => {
    let dateStr = item.date;
    let timeStr = item.time;

    // Tự động format nếu backend trả về timestamp `created_at` (ISO format)
    if (item.created_at) {
      try {
        const d = new Date(item.created_at);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        dateStr = `${day}/${month}/${year}`;
        const hours = String(d.getHours()).padStart(2, "0");
        const mins = String(d.getMinutes()).padStart(2, "0");
        timeStr = `${hours}:${mins}`;
      } catch {
        dateStr = item.created_at.slice(0, 10);
      }
    }

    return {
      id: String(item.id ?? `rec-${idx}`),
      date: dateStr || "Hôm nay",
      time: timeStr || "",
      position: item.target_position ?? item.position ?? "Chưa rõ vị trí",
      company: item.company_name ?? item.company ?? "Doanh nghiệp",
      category: (item.job_category ?? item.category ?? "other") as JobCategory,
      matchScore: Math.round(Number(item.match_score ?? item.matchScore ?? 0)),
      reportUrl: item.report_url ?? item.reportUrl,
      downloadUrl: item.download_url ?? item.downloadUrl,
    };
  });

  const total = Number(data.count ?? data.total ?? rawList.length);

  return {
    records,
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
}

// ─────────────────────────────────────────────────────────
// Public Unified Interface
// ─────────────────────────────────────────────────────────

/**
 * Hàm duy nhất mà giao diện HistoryPageClient gọi vào.
 * Tự động rẽ nhánh Mock Data hoặc Real API theo cấu hình.
 */
export async function fetchHistory(
  params: HistoryQueryParams
): Promise<HistoryApiResponse> {
  if (useMockData) {
    return fetchMockHistory(params);
  }
  return fetchRealHistory(params);
}
