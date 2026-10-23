# 🚀 Ai Career Coach — Backend Service

> Dịch vụ Backend xử lý logic nghiệp vụ và tư vấn nghề nghiệp thông qua AI, được xây dựng trên nền tảng **Django REST Framework** tích hợp **LangChain**, chạy độc lập hoặc qua **Docker Compose**.

---

## 🛠️ Tech Stack & Công Nghệ Key

* **Framework:** Python 3.13+ / Django & Django REST Framework (DRF)
* **AI Orchestration:** LangChain (Quản lý Prompt, Chain, Memory, Agent & LLM Providers)
* **Database:** PostgreSQL (Môi trường Docker/Production) / SQLite (Môi trường Dev)
* **Cache & Async Task:** Redis & Celery (Nếu có dùng xử lý nền)
* **Containerization:** Docker & Docker Compose

---

## 🌐 Quy Ước Port & Môi Trường Chạy

Backend hỗ trợ hai môi trường khởi chạy riêng biệt để tránh xung đột port khi làm việc với Frontend:

| Thành phần | Local Direct (Development) | Docker Environment |
| --- | --- | --- |
| **Backend Django** | **`8000`** | **`8001`** |
| Frontend liên kết | `5173` | `5174` |

* **Local Direct (Port 8000):** Dùng virtualenv để chạy trực tiếp `python manage.py runserver`.
* **Docker (Port 8001):** Dùng Docker Compose để lên toàn bộ môi trường (Django + Database).

---


2. Cài đặt các gói thư viện:
```bash
pip install -r requirements.txt

```


3. Thực hiện Migration & Khởi động Server tại cổng `8000`:
```bash
python manage.py migrate
python manage.py runserver 8000

```


4. Kiểm tra endpoint health check tại: **`[http://127.0.0.1:8000/api/health/](http://127.0.0.1:8000/api/health/)`**

---

## 🔍 Core Endpoints & API Health Check

Backend cung cấp các API chính phục vụ Frontend và tính năng tự động kiểm tra trạng thái tại trang DEV Hub (`/docs`):

### 1. Health Check Endpoint

* **URL (Local):** `GET http://127.0.0.1:8000/api/health/`
* **URL (Docker):** `GET http://127.0.0.1:8001/api/health/`

```
### 2. Key Features API (Ví dụ)

* `POST /api/v1/career/analyze-cv/` — Tiếp nhận CV và sử dụng LangChain để phân tích kĩ năng.
* `POST /api/v1/career/chat/` — Luồng hội thoại tư vấn lộ trình nghề nghiệp (AI Coach).
```