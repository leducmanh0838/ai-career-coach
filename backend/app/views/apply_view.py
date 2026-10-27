# Copyright (c) 2026 AURA FARMING 20 PRO MAX
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from app.models import JobPosting, PersonalizedRoadmap, StudentSkill, JobApplication, Skill
from ..serializers.apply_serializers import JobApplicationSerializer
from ..services.apply_service import CareerCoachService
from ..services.interview_grading_service import InterviewGradingService


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
    API nhận danh sách câu trả lời phỏng vấn theo kỹ năng của sinh viên,
    chấm gộp qua LangChain/OpenAI và tự động cập nhật StudentSkill nếu đạt >= 5.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            student_profile = request.user.student_profile
        except AttributeError:
            return Response(
                {"error": "Tài khoản hiện tại không phải là hồ sơ sinh viên."},
                status=status.HTTP_403_FORBIDDEN
            )

        skill_id = request.data.get("skill_id")
        level = request.data.get("level")  # Ví dụ: "Foundation", "Applied", "Proficient", "Advanced"
        answers = request.data.get("answers", [])  # Danh sách gồm: [{ "question_id": "...", "user_answer": "..." }]

        if not skill_id or not level or not answers:
            return Response(
                {"error": "Thiếu thông tin bắt buộc: skill_id, level hoặc danh sách answers."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            skill = Skill.objects.get(id=skill_id)
        except Skill.DoesNotExist:
            return Response(
                {"error": "Kỹ năng không tồn tại trong hệ thống."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Gọi service chấm gộp đã tối ưu hóa token
        evaluation_result = InterviewGradingService.evaluate_interview_submission(
            student_profile=student_profile,
            skill=skill,
            level=level,
            answers_payload=answers
        )

        if "error" in evaluation_result and not evaluation_result.get("details"):
            return Response(
                {"error": evaluation_result["error"]},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        passed = evaluation_result.get("passed", False)
        message = (
            "🎉 Chúc mừng bạn đã vượt qua bài kiểm tra kỹ năng!"
            if passed
            else "💪 Bạn chưa đạt điểm tối thiểu (>= 5.0/10). Hãy xem lại tài liệu ôn tập và thử lại nhé!"
        )

        return Response({
            "message": message,
            "data": evaluation_result
        }, status=status.HTTP_200_OK)
