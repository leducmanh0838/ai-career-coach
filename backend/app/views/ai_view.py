import json
from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework import permissions

from app.models import JobPosting
from app.services.analyze_skill_service.orchestrator import analyze_document_stream, analyze_document_stream_mock


class DocumentAnalysisSSEView(APIView):
    """API Endpoint sử dụng Server-Sent Events (SSE) để stream tiến độ xử lý real-time"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        pdf_file = request.FILES.get("pdf_file")
        text_content = request.data.get("text_content")
        doc_type = request.data.get("doc_type", "cv")
        # skill_top_k = int(request.data.get("skill_top_k", 5))
        skill_top_k = 5

        job_id = request.data.get("job_posting_id") or request.data.get("job_id")
        job_posting = None

        if job_id and request.user.is_authenticated:
            job_posting = JobPosting.objects.filter(pk=job_id, recruiter=request.user).first()

        raw_use_mock = request.data.get("use_mock", False)
        use_mock = str(raw_use_mock).lower() in ["true", "1", "yes"] or raw_use_mock is True

        user = request.user if request.user.is_authenticated else None

        def event_stream():
            try:
                if use_mock:
                    stream_generator = analyze_document_stream_mock(
                        pdf_file=pdf_file,
                        text_content=text_content,
                        doc_type=doc_type,
                        skill_top_k=skill_top_k,
                        user=user,
                        job_posting=job_posting
                    )
                else:
                    stream_generator = analyze_document_stream(
                        pdf_file=pdf_file,
                        text_content=text_content,
                        doc_type=doc_type,
                        skill_top_k=skill_top_k,
                        user=user,
                        job_posting=job_posting
                    )

                for event_data in stream_generator:
                    # Định dạng chuẩn của SSE: "data: {json_string}\n\n"
                    yield f"data: {json.dumps(event_data, ensure_ascii=False)}\n\n"
            except Exception as e:
                error_payload = json.dumps({"step": "error", "status": "FAILED", "error": str(e)}, ensure_ascii=False)
                yield f"data: {error_payload}\n\n"

        # Trả về StreamingHttpResponse với content_type bắt buộc là text/event-stream
        response = StreamingHttpResponse(event_stream(), content_type="text/event-stream")
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"  # Tắt buffering của Nginx (nếu deploy thực tế)
        return response