from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from app.models import JobPosting, PersonalizedRoadmap, StudentSkill, JobApplication
from ..serializers.apply_serializers import JobApplicationSerializer
from ..services.apply_service import CareerCoachService


class ApplyJobAPIView(APIView):
    """API cho sinh viên ứng tuyển hoặc hủy ứng tuyển job."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, job_id):
        try:
            student_profile = request.user.student_profile
        except AttributeError:
            return Response({"error": "Tài khoản hiện tại không phải là hồ sơ sinh viên."},
                            status=status.HTTP_403_FORBIDDEN)

        try:
            job_posting = JobPosting.objects.get(id=job_id, status=JobPosting.Status.PUBLISHED)
        except JobPosting.DoesNotExist:
            return Response({"error": "Tin tuyển dụng không tồn tại hoặc đã đóng."}, status=status.HTTP_404_NOT_FOUND)

        application = CareerCoachService.apply_job_and_generate_roadmap(student_profile, job_posting)

        serializer = JobApplicationSerializer(application)
        return Response({
            "message": "Ứng tuyển thành công và đã khởi tạo lộ trình học tập!",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    def delete(self, request, job_id):
        """Hủy đơn ứng tuyển của sinh viên đối với một job_id cụ thể."""
        try:
            student_profile = request.user.student_profile
        except AttributeError:
            return Response({"error": "Tài khoản hiện tại không phải là hồ sơ sinh viên."},
                            status=status.HTTP_403_FORBIDDEN)

        try:
            application = JobApplication.objects.get(
                student_profile=student_profile,
                job_posting_id=job_id
            )
        except JobApplication.DoesNotExist:
            return Response({"error": "Bạn chưa ứng tuyển tin tuyển dụng này hoặc đơn không tồn tại."},
                            status=status.HTTP_404_NOT_FOUND)

        application.delete()

        return Response({
            "message": "Đã hủy đơn ứng tuyển và xóa lộ trình học tập thành công!"
        }, status=status.HTTP_200_OK)


class SubmitInterviewAnswerAPIView(APIView):
    """
    API nộp câu trả lời phỏng vấn:
    - Gọi AI chấm điểm (Giả lập hoặc tích hợp OpenAI/Gemini API thực tế trả về điểm từ 0-10).
    - Nếu điểm > 5: Pass -> Cập nhật/Tạo mới StudentSkill lên target_level tương ứng.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        student_profile = request.user.student_profile
        skill_id = request.data.get("skill_id")
        target_level = request.data.get("target_level")
        student_answer = request.data.get("answer")

        if not all([skill_id, target_level, student_answer]):
            return Response({"error": "Thiếu thông tin (skill_id, target_level, answer)."},
                            status=status.HTTP_400_BAD_REQUEST)

        # --- PHẦN TÍCH HỢP AI CHẤM ĐIỂM (Ví dụ gọi LLM) ---
        # score = call_openai_grading_api(student_answer)
        score = 7.5  # Giả định AI chấm được 7.5 điểm
        ai_feedback = "Câu trả lời tốt, nắm vững khái niệm cốt lõi."
        # ---------------------------------------------------

        passed = score > 5.0

        if passed:
            # Cập nhật hoặc tạo mới kỹ năng cho sinh viên trong profile
            StudentSkill.objects.update_or_create(
                student_profile=student_profile,
                skill_id=skill_id,
                defaults={
                    "level": target_level,
                    "reasoning": f"Đã vượt qua bài kiểm tra phỏng vấn mô phỏng với điểm số {score}/10."
                }
            )

        return Response({
            "score": score,
            "passed": passed,
            "feedback": ai_feedback,
            "message": "Chúc mừng bạn đã vượt qua! Kỹ năng trong hồ sơ đã được cập nhật." if passed else "Điểm chưa đạt yêu cầu (<= 5), hãy ôn tập thêm tài liệu."
        }, status=status.HTTP_200_OK)