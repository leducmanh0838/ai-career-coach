# AGENTS.md

Hướng dẫn dành cho AI Coding Agent khi làm việc trong repository này. Áp dụng cho toàn bộ repo; nếu có `AGENTS.md` riêng ở thư mục con trong tương lai, hãy tuân theo cả hướng dẫn ở cấp gần nhất.

## Project Overview

**AI Career Coach** là ứng dụng web hỗ trợ định hướng nghề nghiệp, với backend Django quản lý dữ liệu người dùng, kỹ năng và nghề nghiệp theo bộ dữ liệu ESCO; frontend cung cấp giao diện web và trang DEV Hub để kiểm tra kết nối backend.

Đây là repository gồm hai ứng dụng:

- **Backend:** Python 3.13, Django 6.1, PostgreSQL và `pgvector`. Mô hình dữ liệu lưu người dùng, kỹ năng, nghề nghiệp, quan hệ kỹ năng/nghề nghiệp, bản dịch tiếng Việt và embedding 1536 chiều. Tìm kiếm hiện dùng PostgreSQL Full-Text Search và các vector index.
- **Frontend:** TypeScript, React, Next.js-style App Router qua `vinext`, Vite, Tailwind CSS v4 và tích hợp Cloudflare Workers.
- **AI/dịch thuật:** LangChain và OpenAI cho luồng dịch dự phòng; Google Translate được ưu tiên khi có API key.
- **Triển khai local tích hợp:** Dock[AGENTS.md](../AGENTS.md)er Compose khởi chạy PostgreSQL `pgvector` cùng backend và frontend.

Backend hiện cấu hình Po[AGENTS.md](../AGENTS.md)stgreSQL trực tiếp tr[AGENTS.md](../AGENTS.md)ong `backend/config/settings.py`; không giả định SQLite là database mặc định. Các endpoint nghiệp vụ mới cũng không được xem là đã tồn tại nếu chưa được triển khai trong mã nguồn.
[AGENTS.md](../AGENTS.md)[AGENTS.md](../AGENTS.md)
## Directory Structure

```text
/
├── backend/
│   ├── app/
│   │   ├── management/commands/  # Import/export ESCO, tạo embedding, tiện ích dữ liệu
│   │   ├── migrations/           # Django schema migrations
│   │   ├── services/             # Tìm kiếm, dịch thuật và logic nghiệp vụ
│   │   ├── models.py             # Models Django và chỉ mục PostgreSQL
│   │   ├── urls.py, views.py     # Routes và HTTP handlers của app
│   │   └── tests.py              # Django tests
│   ├── config/                   # Django settings, URL root, ASGI/WSGI
│   ├── data/                     # Dữ liệu JSON dùng cho import
│   ├── dataset/                  # Bộ dữ liệu ESCO nguồn
│   ├── staticfiles/              # Static assets được collect/build
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── entrypoint.sh
├── frontend/
│   ├── app/                      # App Router pages, layouts và API routes
│   ├── components/               # React components dùng lại
│   ├── package.json              # Scripts và dependencies; dùng npm
│   ├── package-lock.json
│   ├── vite.config.ts            # vinext + Cloudflare Vite plugin
│   └── tsconfig.json
├── docker-compose.yml            # PostgreSQL, backend và frontend
├── init.sql                      # Khởi tạo extension/schema PostgreSQL
└── AGENTS.md
```

`backend/staticfiles/`, virtual environments, `frontend/node_modules/` và output build là tài nguyên sinh ra; không chỉnh sửa chúng thay cho mã nguồn gốc.

## Commands

Chạy lệnh Django từ `backend/`, lệnh npm từ `frontend/`, và Docker Compose từ thư mục gốc.

### Backend — PowerShell

```powershell
Set-Location backend
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py check
python manage.py migrate
python manage.py runserver 8000
```

Kiểm tra Django tests bằng `python manage.py test`. `backend/app/tests.py` hiện mới là file khởi tạo, chưa có test nghiệp vụ; khi sửa logic hãy bổ sung test tương ứng.

Các lệnh quản lý dữ liệu hữu ích (chạy có chủ đích, sau khi xác nhận database/môi trường):

```powershell
python manage.py import_esco_json
python manage.py preview_esco
python manage.py embed_skills
python manage.py embed_occupations
```

### Frontend

```powershell
Set-Location frontend
npm ci
npm run dev
npm run build
npm run start
npm run preview
npm run deploy
```

`npm run preview` build rồi chạy preview; `npm run deploy` triển khai Worker nên chỉ dùng khi có chủ đích. Hiện `package.json` không khai báo script `test` hoặc `lint`; không báo cáo các lệnh này là đã chạy thành công. Nếu bổ sung tooling, cập nhật scripts và hướng dẫn tại đây.

### Docker Compose

```powershell
docker compose up --build
docker compose down
```

Compose khai báo frontend tại host port `5174`, backend tại `8001`, PostgreSQL tại `5432`. Entrypoint backend tự chờ database, tạo/apply migrations, import dữ liệu ESCO, collect static files rồi chạy Django. Lưu ý tác động này trước khi khởi chạy trên database có dữ liệu cần giữ. Endpoint kiểm tra backend: `GET http://127.0.0.1:8001/api/health/`; khi chạy trực tiếp thường dùng port `8000`.

## Coding Guidelines & Rules

### Quy tắc chung

- Trước khi sửa, đọc code và cấu hình liên quan; giữ thay đổi tập trung, tương thích với cấu trúc hiện có. Không ghi đè thay đổi chưa commit của người khác.
- Ưu tiên các helper/service hiện có; không thêm dependency, abstraction hay endpoint mới nếu chưa cần thiết.
- Giữ tên biến/hàm dễ hiểu và phù hợp ngôn ngữ của module. Nội dung giao diện hiện ưu tiên tiếng Việt; giữ nhất quán với nội dung xung quanh.
- Không sửa file sinh tự động hoặc dữ liệu import để thay thế cho thay đổi logic. Không thêm dữ liệu người dùng, credentials hay secret vào repository.

### Backend (Python/Django)

- Đặt schema và quan hệ dữ liệu trong Django models; mọi thay đổi schema phải đi cùng migration phù hợp. Không sửa migration đã được áp dụng để thay đổi schema hiện tại.
- Giữ HTTP handlers trong `health_view.py` gọn; đưa logic nghiệp vụ, truy vấn tìm kiếm và tích hợp ngoài vào `app/services/`. Dùng Django management command cho công việc import/export hoặc xử lý dữ liệu chạy thủ công.
- Dùng Django ORM và giữ tính tương thích với PostgreSQL/`pgvector`. Không thay đổi ngầm số chiều embedding (`1536`), tên/cách dùng chỉ mục, hoặc cấu trúc quan hệ ESCO; điều chỉnh cần cập nhật model, migration và luồng sử dụng liên quan.
- Bổ sung type hints và kiểm tra đầu vào ở ranh giới hệ thống. Xử lý lỗi tích hợp ngoài một cách rõ ràng; không trả dữ liệu thành công giả khi provider/database lỗi. Khi đổi xử lý lỗi, giữ logging phù hợp.
- Dùng `python manage.py check` và tests mục tiêu sau khi sửa. Với thay đổi model, kiểm tra migration (`python manage.py makemigrations --check --dry-run`) và migrations cần thiết trên database cấu hình phù hợp.

### Frontend (TypeScript/React)

- Dùng TypeScript có kiểu rõ ràng cho props, state và dữ liệu API; tránh `any`, ép kiểu không cần thiết và bỏ qua lỗi kiểu. Xác thực/thu hẹp kiểu dữ liệu từ API trước khi dùng.
- Tổ chức route theo `frontend/app/`; component có thể tái sử dụng đặt trong `frontend/components/`. Chỉ dùng `"use client"` khi thực sự cần state, effect hoặc browser API.
- Chưa có thư viện quản lý state toàn cục trong cấu hình hiện tại. Ưu tiên state cục bộ React (`useState`, `useEffect`) cho UI cục bộ; chỉ thêm giải pháp toàn cục khi nhu cầu xuyên nhiều route/component chứng minh cần thiết.
- Giữ tương thích với vinext/Vite và Cloudflare Workers; không mặc định các API Node.js hoặc Next.js runtime đều khả dụng trên Worker. Đặt logic tương thích runtime ở đúng ranh giới server/client.
- Tuân thủ Tailwind CSS v4 và design tokens tại `frontend/app/globals.css`: dùng token màu (`primary`, `accent`, `bg`, `surface`, `text`, `muted`, `border` và các token liên quan), không hard-code mã màu cho UI mới. Ưu tiên utility classes; chỉ thêm CSS toàn cục khi thật sự cần.
- Giao diện theo **Light Mode Only**: không tạo class `dark:*`. Dùng các token bo góc chuẩn (`rounded-sm`, `rounded-md`, `rounded-lg`) theo hệ thống hiện có.
- Khi gọi backend, giữ endpoint và port phù hợp môi trường; không đặt API keys/secret trong client bundle. Xử lý trạng thái loading, lỗi và phản hồi HTTP không thành công rõ ràng.

### Environment và dữ liệu nhạy cảm

- Backend đọc `.env` ở thư mục gốc. Docker Compose cũng lấy cấu hình từ môi trường/`.env`; các tên đang được dùng gồm `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `OPENAI_API_KEY` và `GOOGLE_TRANSLATE_API_KEY`.
- Chỉ tham chiếu tên biến trong mã/tài liệu mẫu; không đọc, in, commit hoặc đưa giá trị secret vào log, fixture, lệnh kiểm thử hay phản hồi. Không tạo file `.env` có giá trị thật. Frontend không được đóng gói secret vào JavaScript gửi tới trình duyệt.
- Trước khi thêm biến môi trường mới, xác định nơi đọc biến và cập nhật cấu hình vận hành liên quan (Django settings, Docker Compose hoặc tài liệu); không tạo mặc định giả che giấu cấu hình bắt buộc bị thiếu.

### Kiểm tra trước khi hoàn tất

- Chạy kiểm tra nhỏ nhất phù hợp với thay đổi: Django check/tests cho backend; `npm run build` cho frontend; migration check khi đổi schema.
- Nếu chưa thể chạy do thiếu PostgreSQL, API key hoặc dependency, nêu chính xác điều kiện còn thiếu và không tuyên bố kiểm tra đã đạt.
- Không tuyên bố lint/test đã chạy khi repo chưa có script hoặc cấu hình tương ứng.
