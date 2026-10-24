# app/services/analyze_skill_service/orchestrator.py
import json
import time
import os
import tempfile
from typing import Literal, Optional, Generator, Any
from django.core.files.uploadedfile import UploadedFile

from app.models import AITaskLog
from app.services.analyze_skill_service.ai_config import CRITICAL_MODEL, LIGHT_MODEL, DEFAULT_SKILL_TOP_K, get_llm, \
    get_embeddings
from app.services.analyze_skill_service.utils import extract_document_text, save_debug_artifact
from app.services.analyze_skill_service.retrieval import retrieve_skills_from_occupations, retrieve_skill_candidates
from app.services.analyze_skill_service.pipeline import (
    extract_document_facts,
    match_skills_with_ai,
    auto_expand_unmatched_skills,
    build_final_result,
)
from app.services.student_skill import save_student_analysis_result


def analyze_document_stream(
        pdf_file: Optional[UploadedFile] = None,
        text_content: Optional[str] = None,
        doc_type: Literal["cv", "jd"] = "cv",
        skill_top_k: int = DEFAULT_SKILL_TOP_K,
        debug_dir: Optional[str] = "results/debug",
        user=None,
) -> Generator[dict[str, Any], None, None]:
    """Hàm chạy pipeline dưới dạng Generator, yield từng trạng thái bước để làm SSE."""
    task_type = "cv_analysis" if doc_type == "cv" else "jd_analysis"

    input_payload = {
        "has_pdf_file": bool(pdf_file),
        "file_name": pdf_file.name if pdf_file else None,
        "has_text": bool(text_content),
        "doc_type": doc_type,
        "skill_top_k": skill_top_k
    }

    # 1. Khởi tạo log PENDING trong DB
    task_log = AITaskLog.objects.create(
        user=user,
        task_type=task_type,
        status=AITaskLog.Status.PENDING,
        model_name=CRITICAL_MODEL,
        input_payload=input_payload
    )

    # Gửi sự kiện khởi tạo kèm Task ID cho client biết
    yield {"step": "init", "status": "PENDING", "task_id": str(task_log.id),
           "message": "Đang chuẩn bị hệ thống để phân tích tài liệu..."}

    step_artifacts_dict = {}
    pipeline_start = time.time()
    temp_pdf_path = None

    def update_progress(step_name: str, data, message: str):
        step_artifacts_dict[step_name] = data
        task_log.step_artifacts = step_artifacts_dict
        task_log.save(update_fields=["step_artifacts", "updated_at"])
        # Yield thông tin trạng thái để stream ra client
        return {"step": step_name, "status": "PROCESSING", "message": message}

    try:
        # [Bước 1] Đọc tài liệu
        if text_content and text_content.strip():
            doc_text = text_content.strip()
            yield update_progress("step_1_source", {"type": "text"}, "Đang đọc nội dung văn bản bạn cung cấp...")
        elif pdf_file is not None:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
                for chunk in pdf_file.chunks():
                    tmp_file.write(chunk)
                temp_pdf_path = tmp_file.name

            doc_text = extract_document_text(temp_pdf_path)
            save_debug_artifact(debug_dir, f"step_1_{doc_type}_text.txt", doc_text)
            yield update_progress(f"step_1_{doc_type}_text", doc_text, "Đã đọc xong nội dung từ tệp PDF của bạn...")
        else:
            raise ValueError("Vui lòng cung cấp tệp PDF hoặc nội dung văn bản cần phân tích.")

        llm_critical = get_llm(CRITICAL_MODEL)
        llm_light = get_llm(LIGHT_MODEL)
        embeddings = get_embeddings()

        # [Bước 2] Trích xuất facts
        doc_label = "hồ sơ ứng tuyển (CV)" if doc_type == "cv" else "mô tả công việc (JD)"
        yield {"step": "step_2_start", "status": "PROCESSING",
               "message": f"Hệ thống đang đọc hiểu và phân tích nội dung từ {doc_label}..."}
        facts, extract_tokens = extract_document_facts(llm_critical, doc_text, doc_type=doc_type)
        save_debug_artifact(debug_dir, f"step_2_extracted_facts_{doc_type}.json", facts)
        yield update_progress("step_2_extracted_facts", json.loads(facts.model_dump_json()),
                              "Đã trích xuất thành công các thông tin chính từ tài liệu.")

        # [Bước 3] Truy xuất skill phái sinh
        yield {"step": "step_3_start", "status": "PROCESSING",
               "message": "Đang phân tích các kỹ năng chuyên môn phù hợp với vị trí công việc..."}
        occupation_derived_skills = retrieve_skills_from_occupations(facts.extracted_occupations)
        yield update_progress("step_3_derived_skills_count", len(occupation_derived_skills),
                              "Đã xác định được danh sách kỹ năng liên quan.")

        # [Bước 4] Tạo Embedding & Candidates
        candidates_by_mention = [[] for _ in facts.skills]
        skill_candidates_debug = []

        if facts.skills:
            yield {"step": "step_4_start", "status": "PROCESSING",
                   "message": "Đang đối chiếu và tìm kiếm các kỹ năng trong hệ thống chuẩn hóa..."}
            skill_queries = [s.name for s in facts.skills]
            skill_embeddings = embeddings.embed_documents(skill_queries)

            for idx, skill in enumerate(facts.skills, start=1):
                cands = retrieve_skill_candidates(
                    skill_mention=skill,
                    query_embedding=skill_embeddings[idx - 1],
                    occupation_derived_skills=occupation_derived_skills,
                    top_k=skill_top_k,
                )
                candidates_by_mention[idx - 1] = cands
                skill_candidates_debug.append({
                    "skill_name": skill.name,
                    "evidence": skill.evidence,
                    "candidates_found": cands
                })

            save_debug_artifact(debug_dir, f"step_4_skill_candidates_{doc_type}.json", skill_candidates_debug)
            yield update_progress("step_4_skill_candidates", skill_candidates_debug,
                                  "Đã đối chiếu xong các kỹ năng cần thiết.")

        # [Bước 5.1 & 5.2] AI Xác minh Skill & Dynamic Expansion
        yield {"step": "step_5_start", "status": "PROCESSING",
               "message": "Trợ lý AI đang đánh giá mức độ thành thạo và hoàn thiện kết quả phân tích..."}
        skill_decisions, skill_tokens = match_skills_with_ai(
            llm=llm_critical,
            extracted_skills=facts.skills,
            candidates_by_mention=candidates_by_mention,
            doc_type=doc_type,
        )
        save_debug_artifact(debug_dir, f"step_5_1_skill_decisions_raw_{doc_type}.json", skill_decisions)

        auto_expand_unmatched_skills(
            llm=llm_light,
            embeddings=embeddings,
            extracted_skills=facts.skills,
            skill_decisions=skill_decisions,
        )
        save_debug_artifact(debug_dir, f"step_5_2_skill_decisions_expanded_{doc_type}.json", skill_decisions)
        yield update_progress("step_5_2_skill_decisions_expanded", json.loads(skill_decisions.model_dump_json()),
                              "Đã hoàn tất đánh giá và tổng hợp kỹ năng.")

        # Tổng hợp kết quả cuối cùng (dict chuẩn xác)
        final_result = build_final_result(facts, skill_decisions, doc_type=doc_type)
        save_debug_artifact(debug_dir, f"step_5_3_final_result_{doc_type}.json", final_result)

        if user and user.is_authenticated and doc_type == "cv":
            try:
                save_student_analysis_result(user, final_result)
            except Exception as db_err:
                print(f"⚠️ Cảnh báo: Không thể lưu profile sinh viên vào DB: {db_err}")

        total_prompt = extract_tokens.get("prompt_tokens", 0) + skill_tokens.get("prompt_tokens", 0)
        total_completion = extract_tokens.get("completion_tokens", 0) + skill_tokens.get("completion_tokens", 0)
        grand_total = total_prompt + total_completion
        total_time = time.time() - pipeline_start

        if temp_pdf_path and os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)

        # Cập nhật SUCCESS vào DB
        task_log.status = AITaskLog.Status.SUCCESS
        task_log.step_artifacts = step_artifacts_dict
        task_log.output_payload = final_result
        task_log.metrics = {
            "execution_time_seconds": round(total_time, 2),
            "prompt_tokens": total_prompt,
            "completion_tokens": total_completion,
            "total_tokens": grand_total
        }
        task_log.save()

        # Yield kết quả cuối cùng cho client
        yield {
            "step": "completed",
            "status": "SUCCESS",
            "task_id": str(task_log.id),
            "message": "Phân tích tài liệu thành công!",
            "data": final_result
        }

    except Exception as e:
        if temp_pdf_path and os.path.exists(temp_pdf_path):
            try:
                os.remove(temp_pdf_path)
            except:
                pass

        total_time = time.time() - pipeline_start
        task_log.status = AITaskLog.Status.FAILED
        task_log.step_artifacts = step_artifacts_dict
        task_log.error_message = str(e)
        task_log.metrics = {"execution_time_seconds": round(total_time, 2)}
        task_log.save()

        yield {
            "step": "error",
            "status": "FAILED",
            "task_id": str(task_log.id),
            "message": "Rất tiếc, đã có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại sau.",
            "error": str(e)
        }


def analyze_document_stream_mock(
        pdf_file: Optional[UploadedFile] = None,
        text_content: Optional[str] = None,
        doc_type: Literal["cv", "jd"] = "cv",
        skill_top_k: int = 5,
        mock_dir: str = "app/services/analyze_skill_service/mock",  # Thư mục chứa các file mẫu (mock)
        user=None,
) -> Generator[dict[str, Any], None, None]:
    """Hàm chạy pipeline giả lập (Mock) bằng cách đọc dữ liệu có sẵn từ thư mục debug/mock để tiết kiệm token."""
    task_type = "cv_analysis" if doc_type == "cv" else "jd_analysis"

    input_payload = {
        "has_pdf_file": bool(pdf_file),
        "file_name": pdf_file.name if pdf_file else None,
        "has_text": bool(text_content),
        "doc_type": doc_type,
        "skill_top_k": skill_top_k
    }

    # 1. Khởi tạo log PENDING trong DB
    task_log = AITaskLog.objects.create(
        user=user,
        task_type=task_type,
        status=AITaskLog.Status.PENDING,
        model_name="mock-model",
        input_payload=input_payload
    )

    # Gửi sự kiện khởi tạo kèm Task ID cho client
    yield {
        "step": "init",
        "status": "PENDING",
        "task_id": str(task_log.id),
        "message": "Đang chuẩn bị hệ thống (Mock Mode)..."
    }

    step_artifacts_dict = {}
    pipeline_start = time.time()

    def update_progress(step_name: str, data, message: str):
        step_artifacts_dict[step_name] = data
        task_log.step_artifacts = step_artifacts_dict
        task_log.save(update_fields=["step_artifacts", "updated_at"])
        return {"step": step_name, "status": "PROCESSING", "message": message}

    try:
        time.sleep(0.5)  # Giả lập độ trễ đọc file/mạng

        # [Bước 1] Đọc tài liệu (Đọc từ file text mẫu)
        text_file_path = os.path.join(mock_dir, f"step_1_{doc_type}_text.txt")
        if os.path.exists(text_file_path):
            with open(text_file_path, "r", encoding="utf-8") as f:
                doc_text = f.read()
        else:
            doc_text = text_content or "Mock document text content..."

        step_1_key = f"step_1_{doc_type}_text" if pdf_file is not None else "step_1_source"
        yield update_progress(step_1_key, doc_text, "Đã đọc xong nội dung từ tài liệu (Mock)...")
        time.sleep(0.5)

        # [Bước 2] Trích xuất facts (Đọc từ file JSON mẫu)
        doc_label = "hồ sơ ứng tuyển (CV)" if doc_type == "cv" else "mô tả công việc (JD)"
        yield {"step": "step_2_start", "status": "PROCESSING",
               "message": f"Hệ thống đang đọc hiểu và phân tích nội dung từ {doc_label} (Mock)..."}

        facts_file_path = os.path.join(mock_dir, f"step_2_extracted_facts_{doc_type}.json")
        facts_data = {}
        if os.path.exists(facts_file_path):
            with open(facts_file_path, "r", encoding="utf-8") as f:
                facts_data = json.load(f)

        yield update_progress("step_2_extracted_facts", facts_data,
                              "Đã trích xuất thành công các thông tin chính từ tài liệu (Mock).")
        time.sleep(0.5)

        # [Bước 3] Truy xuất skill phái sinh
        yield {"step": "step_3_start", "status": "PROCESSING",
               "message": "Đang phân tích các kỹ năng chuyên môn phù hợp với vị trí công việc (Mock)..."}
        yield update_progress("step_3_derived_skills_count", 8, "Đã xác định được danh sách kỹ năng liên quan (Mock).")
        time.sleep(0.5)

        # [Bước 4] Candidates (Đọc từ file JSON mẫu)
        candidates_file_path = os.path.join(mock_dir, f"step_4_skill_candidates_{doc_type}.json")
        skill_candidates_debug = []
        if os.path.exists(candidates_file_path):
            with open(candidates_file_path, "r", encoding="utf-8") as f:
                skill_candidates_debug = json.load(f)

        if skill_candidates_debug:
            yield {"step": "step_4_start", "status": "PROCESSING",
                   "message": "Đang đối chiếu và tìm kiếm các kỹ năng trong hệ thống chuẩn hóa (Mock)..."}
            yield update_progress("step_4_skill_candidates", skill_candidates_debug,
                                  "Đã đối chiếu xong các kỹ năng cần thiết (Mock).")
        time.sleep(0.5)

        # [Bước 5.1 & 5.2] AI Xác minh Skill & Dynamic Expansion (Đọc từ file JSON mẫu)
        yield {"step": "step_5_start", "status": "PROCESSING",
               "message": "Trợ lý AI đang đánh giá mức độ thành thạo và hoàn thiện kết quả phân tích (Mock)..."}

        expanded_file_path = os.path.join(mock_dir, f"step_5_2_skill_decisions_expanded_{doc_type}.json")
        skill_decisions_data = {}
        if os.path.exists(expanded_file_path):
            with open(expanded_file_path, "r", encoding="utf-8") as f:
                skill_decisions_data = json.load(f)

        yield update_progress("step_5_2_skill_decisions_expanded", skill_decisions_data,
                              "Đã hoàn tất đánh giá và tổng hợp kỹ năng (Mock).")
        time.sleep(0.5)

        # Tổng hợp kết quả cuối cùng (Đọc từ file final result mẫu)
        final_result_file_path = os.path.join(mock_dir, f"step_5_3_final_result_{doc_type}.json")
        if os.path.exists(final_result_file_path):
            with open(final_result_file_path, "r", encoding="utf-8") as f:
                final_result = json.load(f)
        else:
            final_result = skill_decisions_data

        # Lưu vào DB nếu là CV và user đã đăng nhập
        if user and user.is_authenticated and doc_type == "cv":
            try:
                save_student_analysis_result(user, final_result)
            except Exception as db_err:
                print(f"⚠️ Cảnh báo: Không thể lưu profile sinh viên vào DB: {db_err}")

        total_time = time.time() - pipeline_start

        # Cập nhật SUCCESS vào DB
        task_log.status = AITaskLog.Status.SUCCESS
        task_log.step_artifacts = step_artifacts_dict
        task_log.output_payload = final_result
        task_log.metrics = {
            "execution_time_seconds": round(total_time, 2),
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0
        }
        task_log.save()

        # Yield kết quả cuối cùng cho client
        yield {
            "step": "completed",
            "status": "SUCCESS",
            "task_id": str(task_log.id),
            "message": "Phân tích tài liệu thành công (Mock Mode)!",
            "data": final_result
        }

    except Exception as e:
        total_time = time.time() - pipeline_start
        task_log.status = AITaskLog.Status.FAILED
        task_log.step_artifacts = step_artifacts_dict
        task_log.error_message = str(e)
        task_log.metrics = {"execution_time_seconds": round(total_time, 2)}
        task_log.save()

        yield {
            "step": "error",
            "status": "FAILED",
            "task_id": str(task_log.id),
            "message": "Rất tiếc, đã có lỗi xảy ra trong quá trình xử lý mock.",
            "error": str(e)
        }
