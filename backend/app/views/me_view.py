# app/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from app.models import CustomUser
from app.serializers.me_serializers import UserMeBaseSerializer, UserMeDetailSerializer


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