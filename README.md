# 🎯 AI Career Coach — Trợ lý định hướng nghề nghiệp và luyện phỏng vấn thông minh


[![License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Backend](https://img.shields.io/badge/Backend-Django%20%26%20DRF-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![AI Framework](https://img.shields.io/badge/AI-LangChain%20%26%20LangGraph-1C3C3C?logo=langchain&logoColor=white)](https://docs.langchain.com/)
[![LLM](https://img.shields.io/badge/LLM-OpenAI%20GPT--4o-412991?logo=openai&logoColor=white)](https://platform.openai.com/docs/)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%20%2B%20TypeScript-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/docs)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20pgvector-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/docs/)


## **AI Career Coach** là hệ thống ứng dụng **Trí tuệ nhân tạo (AI)** giúp phân tích khoảng cách năng lực của sinh viên, đề xuất lộ trình học tập cá nhân hóa và cung cấp môi trường luyện phỏng vấn ảo sát với thực tế tuyển dụng.

---

## 🎯 Mục tiêu của dự án

- 📄 **Phân tích & Đánh giá năng lực (Skill Gap Analysis):**  
  AI đọc **CV của sinh viên** hoặc **mô tả công việc (JD)**, trích xuất các skill, đánh giá level của mỗi skill dựa vào dự án thực tế, kinh nghiệm,.... Từ đó AI so sánh level của từng skill, đưa ra lộ trình học tập phù hợp .

- 🗺️ **Lộ trình học tập cá nhân hóa:**  
  Đề xuất lộ trình nâng cao kỹ năng, gợi ý tài liệu ôn tập và bài tập thực hành từ database phù hợp với khoảng cách năng lực của sinh viên.

- 🎙️ **Trợ lý phỏng vấn thông minh (AI Interview Simulator):**  
  Mô phỏng các buổi phỏng vấn giả định theo từng vị trí công việc, đưa ra bộ câu hỏi sát thực tế và phân tích/chấm điểm câu trả lời thời gian thực.

---

## 🛠️ Công nghệ sử dụng

| Thành phần | Công nghệ | Chức năng | Ưu điểm |
| :--- | :--- | :--- | :--- |
| **Frontend** | ⚛️ Next.js + TypeScript | Xây dựng giao diện người dùng tương tác, hiển thị lộ trình học và phòng phỏng vấn ảo. | Hiệu năng cao ⚡, trải nghiệm mượt mà, hỗ trợ SSR/SSG. |
| **Backend** | 🐍 Django + Django REST Framework | Xử lý logic nghiệp vụ, quản lý tài khoản, dữ liệu ngành nghề và hệ thống API. | Mạnh mẽ 💪, bảo mật, tích hợp **Django Admin** quản trị dữ liệu dễ dàng 🛠️. |
| **AI / LLM** | 🧠 LangChain + OpenAI | Trích xuất tri thức, phân tích CV/JD, chấm điểm phỏng vấn. | Xử lý ngữ cảnh thông minh 🤖. |
| **Database** | 🐘 PostgreSQL + pgvector | Lưu trữ dữ liệu hệ thống (User, CV, Kết quả) đồng thời lưu vector embedding để search similarity. | Gọn nhẹ, lưu trữ cả relational & vector trong cùng 1 cơ sở dữ liệu 🗄️. |

---

## 💡 Tính năng nổi bật

✅ **Upload & Phân tích CV tự động (PDF Parsing)**  
✅ **So sánh Skill Gap giữa CV và JD tuyển dụng**  
✅ **Tự động gợi ý lộ trình học & bài tập từ Database**  
✅ **Mô phỏng phỏng vấn AI và chấm điểm dựa trên đáp án chuẩn**  
✅ **Trang quản trị (Django Admin) quản lý Skill chuẩn, Job chuẩn & Ngân hàng câu hỏi**

---

## 🏗️ Kiến trúc hệ thống
<div align="center">
  <img src="./assets/architecture_diagram.png" alt="Architecture" width="800">
</div>

---

## 🧩 Yêu cầu hệ thống (Prerequisites)

- 🧰 **Git** – Quản lý mã nguồn.
- 📦 **Node.js (≥ 24)** & **npm (≥ 11)** – Chạy ứng dụng Next.js.
- 🐍 **Python (≥ 3.13)** & **pip** – Chạy backend Django và hệ sinh thái LangChain.
- 🔑 **OpenAI API Key** – Dùng cho mô hình GPT và Embeddings.

---

## 🚀 Hướng dẫn cài đặt và chạy dự án

### 1. Yêu cầu hệ thống

Trước khi cài đặt, hãy đảm bảo máy tính đã có:

- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) hoặc Docker Engine.
- Docker Compose v2 trở lên.
- Kết nối Internet để tải các image và dependency cần thiết.

Không cần cài Python, Node.js hoặc PostgreSQL trực tiếp trên máy nếu toàn bộ dịch vụ đã được cấu hình trong Docker Compose.

### 2. Clone repository

```bash
git clone https://github.com/leducmanh0838/ai-career-coach.git
cd ai-career-coach
```

### 3. Cấu hình biến môi trường

Tạo file `.env` tại vị trí được Docker Compose và ứng dụng sử dụng. Tham khảo file `.env.example` nếu repository có cung cấp.

Ví dụ cấu hình:

```dotenv
SECRET_KEY=your_django_secret_key

DB_NAME=ai_career_coach
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=db
DB_PORT=5432

OPENAI_API_KEY=your_openai_api_key

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

NEXT_PUBLIC_API_URL=http://localhost:8001
```

**Lưu ý:**
- Thay các giá trị mẫu bằng thông tin cấu hình phù hợp với môi trường của bạn.
- `DB_HOST=db` chỉ đúng nếu service PostgreSQL trong `docker-compose.yml` có tên `db`. Nếu tên service khác, hãy sử dụng tên service tương ứng.
- Nếu đăng nhập Google được bật, hãy cấu hình OAuth Client ID và Client Secret hợp lệ.
- Các tính năng sử dụng mô hình ngôn ngữ cần API key hợp lệ.
- Không commit file `.env` chứa thông tin bí mật lên repository công khai.

### 4. Build và khởi chạy

Từ thư mục gốc của dự án, chạy:

```bash
docker compose up --build
```

Lệnh này sẽ build các image cần thiết và khởi chạy các service được khai báo trong Docker Compose.

Để chạy ở chế độ nền:

```bash
docker compose up --build -d
```

Kiểm tra trạng thái các service:

```bash
docker compose ps
```

Xem log khi cần kiểm tra lỗi:

```bash
docker compose logs -f
```

Nếu cần xem log của một service cụ thể:

```bash
docker compose logs -f <service_name>
```

### 5. Truy cập ứng dụng

Sau khi các service khởi động thành công, truy cập frontend và các endpoint được cấu hình trong dự án.

| Thành phần | Địa chỉ |
|---|---|
| Frontend | `http://localhost:5174` |
| Backend API | `http://localhost:8001` |
| Admin | `http://localhost:8001/admin` |

Nếu các cổng trong `docker-compose.yml` khác với bảng trên, hãy sử dụng cổng được khai báo trong cấu hình thực tế.


### 6. Dừng và khởi động lại

Dừng các service:

```bash
docker compose down
```

Khởi động lại:

```bash
docker compose up -d
```

Lệnh `docker compose down` mặc định không xóa named volumes. Không sử dụng tùy chọn `-v` nếu muốn giữ dữ liệu database.

### 7. Xử lý sự cố thường gặp

- **Cổng đã được sử dụng:** Kiểm tra các tiến trình hoặc container đang sử dụng cổng được khai báo trong Docker Compose.
- **Backend không kết nối được database:** Kiểm tra trạng thái service database, tên host, thông tin đăng nhập và log.
- **Lỗi xác thực AI:** Kiểm tra `OPENAI_API_KEY` và quyền sử dụng API.
- **Không đăng nhập được bằng Google:** Kiểm tra OAuth Client ID, Client Secret và các URL callback đã đăng ký.
- **Service khởi động thất bại:** Kiểm tra `docker compose ps` và `docker compose logs -f`.

Nếu vẫn gặp lỗi, hãy cung cấp log liên quan khi tạo issue trên GitHub để nhóm phát triển hỗ trợ.

## 📚 Tài liệu tham khảo (References & Documentation)

Quá trình phát triển dự án dựa trên tài liệu chính thức từ các công nghệ sau:

* 🐍 **Django:** [Django Documentation](https://docs.djangoproject.com/)
* 🚀 **Django REST Framework:** [DRF Guide](https://www.django-rest-framework.org/)
* ⚛️ **Next.js:** [Next.js Docs](https://nextjs.org/docs)
* 🧠 **LangChain:** [LangChain Python Documentation](https://python.langchain.com/)
* 🐘 **PostgreSQL & pgvector:** [PostgreSQL Docs](https://www.postgresql.org/docs/) & [pgvector GitHub](https://github.com/pgvector/pgvector)
* 🤖 **OpenAI API:** [OpenAI Platform Documentation](https://platform.openai.com/docs/)

---

## 👥 Cộng đồng & Hỗ trợ (Community & Support)

AI Career Coach chào đón người dùng, nhà phát triển và các cộng tác viên mã nguồn mở cùng tham gia đóng góp và phát triển dự án.

- **📧 Mailing List (Danh sách gửi thư):** [Cộng đồng AI Career Coach](https://groups.google.com/g/ai-career-coach-community) — Trao đổi về dự án, đặt câu hỏi, chia sẻ kinh nghiệm và nhận thông báo về các bản phát hành mới.
- **🐛 Báo lỗi & Đề xuất tính năng:** [GitHub Issues](https://github.com/leducmanh0838/ai-career-coach/issues) — Báo cáo lỗi, đề xuất tính năng mới và theo dõi tiến độ xử lý các vấn đề của dự án.
- **💻 Mã nguồn dự án:** [GitHub Repository](https://github.com/leducmanh0838/ai-career-coach) — Xem mã nguồn, đóng góp cải tiến và gửi Pull Request để đề xuất thay đổi.

**Hướng dẫn tham gia:**
- Khi phát hiện lỗi hoặc muốn đề xuất tính năng, vui lòng tạo Issue trên GitHub để thuận tiện theo dõi và xử lý.
- Đối với các câu hỏi chung, thảo luận và trao đổi giữa cộng đồng, vui lòng sử dụng Mailing List.
- Các đóng góp về mã nguồn đều được hoan nghênh nhằm giúp AI Career Coach ngày càng hoàn thiện hơn.

## 👥 Tác giả (Authors)
Lê Đức Mạnh — Team Leader & Developer — manhz.dev

## 🧾 Giấy phép
Dự án này được phân phối theo Giấy phép MIT License.
