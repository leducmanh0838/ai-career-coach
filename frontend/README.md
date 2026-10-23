# 🚀 Ai Career Coach

> Dự án web được khởi tạo bằng **Vinext** chạy trên nền Cloudflare Workers, tích hợp giao diện Next.js/React tuân thủ nghiêm ngặt **Tailwind CSS v4 (Light Mode Only)** và kết nối Django Backend.

---

## 🛠️ Tech Stack & Cấu hình
- **Framework:** Next.js (App Router) qua **Vinext** adapter (Cloudflare Worker output)
- **Styling:** Tailwind CSS v4 (Sử dụng `@theme` tokens tập trung tại `globals.css`)
- **Backend:** Django REST API (Chạy qua Docker tại cổng `8001`)
- **Giao diện:** Cố định **Light Mode Only** (Không sử dụng chế độ tối `dark:*`).

---

## 📜 NPM Scripts (Vinext & Cloudflare)
- `pnpm run dev` — Khởi động môi trường phát triển (Vinext dev server).
- `pnpm run build` — Biên dịch mã nguồn thành Cloudflare Worker output.
- `pnpm run start` — Xem trước (preview) Worker đã build trên máy cục bộ.
- `pnpm run deploy` — Triển khai ứng dụng lên Cloudflare Worker.

---

## 📋 Quy Chuẩn Thiết Kế & Design Tokens (Tailwind v4)
Toàn bộ mã nguồn giao diện phải tuân thủ hệ thống biến token đã được cấu hình trong `globals.css`:
- **Màu thương hiệu chính (`bg-primary`):** `#3346f0`
- **Màu nhấn (`bg-accent`):** `#ffb224`
- **Màu nền (`bg-bg`):** `#f6f7fb`
- **Màu khối (`bg-surface`):** `#ffffff`
- **Bo góc tiêu chuẩn:** `rounded-sm` (8px), `rounded-md` (16px), `rounded-lg` (28px).

---

## 🔍 Trang DEV Hub Nội Bộ (`/docs`)
Dự án tích hợp sẵn trang tài liệu dành riêng cho lập trình viên tại đường dẫn:
👉 **`http://localhost:5173/docs`**

Tính năng nổi bật tại trang `/docs`:
1. **Kiểm tra tự động Backend Health-Check:** Tự động gọi API `http://127.0.0.1:8001/api/health/` để kiểm tra trạng thái kết nối với Django backend.
2. **Cảnh báo Docker Desktop:** Tự động hiển thị hướng dẫn bật Docker Desktop nếu container backend bị mất kết nối (Offline).

---

## ⚙️ Hướng Dẫn Khởi Chạy Cho DEV

### 1. Khởi động Backend (Django qua Docker)
1. Đảm bảo **Docker Desktop** đã được mở trên máy của bạn.
2. Tại thư mục chứa backend, chạy lệnh:
   ```bash
   docker compose up --build
3. Đảm bảo container chạy thành công và endpoint phản hồi tại `http://127.0.0.1:8001/api/health/`.

### 2. Khởi động Frontend (Vinext)
1. Mở một terminal mới, di chuyển đến thư mục frontend và cài đặt các gói phụ thuộc bằng **npm**:
```bash
npm install
```

2. Khởi động môi trường phát triển:

```bash
npm run dev
```

Truy cập trình duyệt tại http://localhost:3000/docs để theo dõi trạng thái hệ thống và quy chuẩn của nhóm.


## 🌐 Quy ước Port theo môi trường

Dự án sử dụng các cổng riêng biệt cho môi trường phát triển trực tiếp và môi trường Docker nhằm tránh xung đột cổng khi chạy đồng thời nhiều dịch vụ.

| Thành phần | Chạy trực tiếp trên máy (Development) | Chạy bằng Docker (Docker Environment) |
|---|---:|---:|
| Frontend | `5173` | `5174` |
| Backend Django | `8000` | `8001` |

**Quy ước sử dụng:**

- **Development:** Chạy frontend và backend trực tiếp trên máy để phát triển, debug và kiểm tra code.
- **Docker Environment:** Chạy toàn bộ frontend và backend bằng Docker Compose. Các cổng `5174` và `8001` được ánh xạ ra máy host để truy cập từ bên ngoài container.
- **Tránh xung đột:** Hai môi trường sử dụng các cổng host khác nhau, cho phép chạy đồng thời mà không tranh chấp các cổng tương ứng, miễn là các cổng này chưa được dịch vụ khác sử dụng.

Ví dụ khi chạy đồng thời cả hai môi trường:

- Frontend Development: `http://localhost:5173`
- Backend Development: `http://localhost:8000`
- Frontend Docker: `http://localhost:5174`
- Backend Docker: `http://localhost:8001`

**Lưu ý:** Các cổng trên là cổng truy cập từ máy host. Bên trong Docker, mỗi container có thể sử dụng cổng riêng theo cấu hình service. Docker Compose chịu trách nhiệm ánh xạ cổng host sang cổng container tương ứng.

## 🔍 DEV Hub — Kiểm tra hệ thống (`/docs`)

Frontend tích hợp trang **Developer Documentation & Guidelines** tại `/docs`, phục vụ việc tra cứu quy chuẩn phát triển và kiểm tra kết nối giữa frontend với Django backend.

### 1. Địa chỉ truy cập

| Môi trường | DEV Hub |
|---|---|
| Development | `http://localhost:5173/docs` |
| Docker | `http://localhost:5174/docs` |

### 2. Kiểm tra trạng thái Backend

DEV Hub tích hợp chức năng **Backend Health Check**, sử dụng endpoint `/api/health/` để kiểm tra backend Django có phản hồi hay không.

| Môi trường | Health Check URL |
|---|---|
| Development | `http://127.0.0.1:8000/api/health/` |
| Docker | `http://127.0.0.1:8001/api/health/` |

Khu vực **Backend Status** hiển thị các thông tin:

- **Trạng thái kết nối:** Cho biết backend có phản hồi thành công hay không.
- **Endpoint:** Đường dẫn API được sử dụng để kiểm tra.
- **Phản hồi API:** Hiển thị trạng thái và thông báo trả về từ backend.
- **Thời điểm cập nhật:** Thời điểm kiểm tra gần nhất.
- **Ping Backend:** Cho phép lập trình viên chủ động gửi yêu cầu kiểm tra lại backend.

### 3. Cách sử dụng

1. Khởi động frontend theo môi trường đang sử dụng.
2. Khởi động Django backend hoặc Docker Compose.
3. Truy cập trang `/docs`.
4. Quan sát khu vực **Backend Status**.
5. Nhấn **Ping Backend** để kiểm tra lại khi cần.