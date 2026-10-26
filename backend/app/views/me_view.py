# app/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics, viewsets
from app.models import CustomUser, StudentProfile, StudentSkill, JobPosting, JobRequiredSkill
from app.perms import IsStudentRole, IsRecruiterRole
from app.serializers.me_serializers import UserMeBaseSerializer, UserMeDetailSerializer, StudentProfileSerializer, \
    UserRecruiterDetailSerializer
from app.serializers.job_posting_serializers import JobPostingSerializer, JobPostingDetailSerializer, \
    JobRequiredSkillSerializer
from app.serializers.skill_serializers import StudentSkillSerializer
from rest_framework.decorators import action


class UserMeAPIView(APIView):
    """Endpoint /me/: Chỉ lấy thông tin cá nhân và profile (Tối ưu, chỉ join 1 bảng)"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Chỉ join bảng student_profile
        user = CustomUser.objects.select_related("student_profile").get(pk=request.user.pk)
        serializer = UserMeBaseSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserMeDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = CustomUser.objects.select_related("student_profile").prefetch_related(
            "student_profile__student_skills",
            "student_profile__student_skills__skill"
        ).get(pk=request.user.pk)

        serializer = UserMeDetailSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserRecruiterDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiterRole]

    def get(self, request, *args, **kwargs):
        user = CustomUser.objects.prefetch_related("job_postings").get(
            pk=request.user.pk
        )

        serializer = UserRecruiterDetailSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class StudentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_codes = [permissions.IsAuthenticated, IsStudentRole]  # Đảm bảo đã đăng nhập và đúng role student
    permission_classes = [permissions.IsAuthenticated, IsStudentRole]

    def get_object(self):
        profile, created = StudentProfile.objects.get_or_create(user=self.request.user)
        return profile


class StudentSkillViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSkillSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudentRole]

    def get_queryset(self):
        print("CURRENT USER REQUESTING:", self.request.user)  # Thêm dòng này để nhìn log terminal
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        return StudentSkill.objects.filter(student_profile=profile).select_related("skill")

    def perform_create(self, serializer):
        """Tự động gắn student_profile của user hiện tại khi thêm kỹ năng mới"""
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        serializer.save(student_profile=profile)


class MeJobPostingViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsRecruiterRole]

    def get_serializer_class(self):
        if self.action == "list":
            return JobPostingSerializer
        return JobPostingDetailSerializer

    def get_queryset(self):
        queryset = JobPosting.objects.filter(recruiter=self.request.user)
        if self.action == "retrieve":
            queryset = queryset.prefetch_related("required_skills__skill")
        return queryset

    def perform_create(self, serializer):
        serializer.save(recruiter=self.request.user)

    # ==================== CÁC ACTION QUẢN LÝ KỸ NĂNG (SKILLS) ====================

    @action(detail=True, methods=["get", "post"], url_path="skills")
    def list_or_add_skills(self, request, pk=None):
        """
        - GET: Lấy danh sách kỹ năng yêu cầu của tin tuyển dụng: GET /api/me/job-postings/<id>/skills/
        - POST: Thêm thủ công một kỹ năng yêu cầu: POST /api/me/job-postings/<id>/skills/
        """
        job_posting = self.get_object()  # Tự động check quyền sở hữu của recruiter

        if request.method == "GET":
            # Lấy các kỹ năng yêu cầu thuộc job_posting này (có thể prefetch kèm skill chuẩn nếu cần)
            skills = job_posting.required_skills.select_related("skill").all()
            serializer = JobRequiredSkillSerializer(skills, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Xử lý POST (Thêm mới)
        serializer = JobRequiredSkillSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(job=job_posting)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["put", "patch", "delete"], url_path="skills/(?P<skill_id>[^/.]+)")
    def manage_skill(self, request, pk=None, skill_id=None):
        """
        Sửa hoặc Xóa kỹ năng yêu cầu:
        - PUT / PATCH: /api/me/job-postings/<job-id>/skills/<skill-id>/
        - DELETE: /api/me/job-postings/<job-id>/skills/<skill-id>/
        """
        job_posting = self.get_object()

        try:
            job_skill = JobRequiredSkill.objects.get(pk=skill_id, job=job_posting)
        except JobRequiredSkill.DoesNotExist:
            return Response({"detail": "Không tìm thấy kỹ năng yêu cầu này."}, status=status.HTTP_404_NOT_FOUND)

        if request.method == "DELETE":
            job_skill.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        partial = request.method == "PATCH"
        serializer = JobRequiredSkillSerializer(job_skill, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)