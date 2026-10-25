# app/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics, viewsets
from app.models import CustomUser, StudentProfile, StudentSkill
from app.perms import IsStudentRole
from app.serializers.me_serializers import UserMeBaseSerializer, UserMeDetailSerializer, StudentProfileSerializer
from app.serializers.skill_serializers import StudentSkillSerializer


class UserMeAPIView(APIView):
    """Endpoint /me/: Chỉ lấy thông tin cá nhân và profile (Tối ưu, chỉ join 1 bảng)"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Chỉ join bảng student_profile
        user = CustomUser.objects.select_related("student_profile").get(pk=request.user.pk)
        serializer = UserMeBaseSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserMeDetailAPIView(APIView):
    """Endpoint /me/detail/: Lấy đầy đủ thông tin chi tiết kèm toàn bộ kỹ năng"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Join profile và prefetch toàn bộ student_skills cùng bảng Skill liên quan
        user = CustomUser.objects.select_related("student_profile").prefetch_related(
            "student_profile__student_skills",
            "student_profile__student_skills__skill"
        ).get(pk=request.user.pk)

        serializer = UserMeDetailSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class StudentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_codes = [permissions.IsAuthenticated, IsStudentRole] # Đảm bảo đã đăng nhập và đúng role student
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
