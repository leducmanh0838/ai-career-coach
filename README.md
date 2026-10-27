# 🎯 AI Career Coach — Trợ lý định hướng nghề nghiệp và luyện phỏng vấn thông minh

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Backend](https://img.shields.io/badge/Backend-Django_&_DRF-092E20?logo=django)]()
[![AI Framework](https://img.shields.io/badge/AI-LangChain_&_LangGraph-1C3C3C)]()
[![LLM](https://img.shields.io/badge/LLM-OpenAI_GPT--4o-00b3ff?logo=openai)]()
[![Frontend](https://img.shields.io/badge/Frontend-Next.js_TypeScript-000000?logo=next.js)]()
[![Database](https://img.shields.io/badge/Database-PostgreSQL_%2B_pgvector-4169E1?logo=postgresql)]()

## **AI Career Coach** là hệ thống ứng dụng **Trí tuệ nhân tạo (AI)** giúp phân tích khoảng cách năng lực của sinh viên, đề xuất lộ trình học tập cá nhân hóa và cung cấp môi trường luyện phỏng vấn ảo sát với thực tế tuyển dụng.

---

## 🎯 Mục tiêu của dự án

- 📄 **Phân tích & Đánh giá năng lực (Skill Gap Analysis):**  
  Tự động bóc tách dữ liệu từ **CV của sinh viên** và **mô tả công việc (JD)**, so sánh để xác định chính xác điểm mạnh, điểm yếu và tỷ lệ phù hợp (Match Level).

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