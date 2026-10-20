from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """Custom User model extending Django's AbstractUser to support

    AI Career Coach roles (e.g., Student, Recruiter) and additional attributes.
    """

    ROLE_CHOICES = (
        ("student", "Sinh viên"),
        ("recruiter", "Nhà tuyển dụng"),
        ("admin", "Quản trị viên"),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="student",
        verbose_name="Vai trò người dùng",
    )
    phone_number = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        verbose_name="Số điện thoại",
    )
    avatar_url = models.URLField(
        blank=True,
        null=True,
        verbose_name="Đường dẫn ảnh đại diện",
    )

    class Meta:
        db_table = "users"
        verbose_name = "Người dùng"
        verbose_name_plural = "Danh sách người dùng"

    def __str__(self):
        name_str = f" - {self.get_full_name()}" if self.get_full_name() else ""
        return f"{self.username}{name_str} ({self.get_role_display()})"


class Skill(models.Model):
    """Standardized Skill Taxonomy table for AI Career Coach system.

    Stores canonical skills and their synonyms.
    """

    name = models.CharField(
        max_length=255, unique=True, verbose_name="Tên kỹ năng chuẩn"
    )
    synonyms = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Danh sách từ đồng nghĩa (JSON list)",
    )
    created_at = models.DateTimeField(
        auto_now_add=True, verbose_name="Ngày tạo"
    )
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ngày cập nhật")

    class Meta:
        verbose_name = "Kỹ năng chuẩn"
        verbose_name_plural = "Danh mục kỹ năng chuẩn"

    def __str__(self):
        return self.name


class SkillLevelDetail(models.Model):
    """Detailed content for each skill level (1 through 4), including reference

    materials and interview questions.
    """

    LEVEL_CHOICES = (
        (1, "Cơ bản (Beginner)"),
        (2, "Trung bình (Intermediate)"),
        (3, "Nâng cao (Advanced)"),
        (4, "Chuyên gia (Expert)"),
    )

    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="level_details",
        verbose_name="Kỹ năng chuẩn",
    )
    level = models.IntegerField(choices=LEVEL_CHOICES, verbose_name="Mức độ")
    description = models.TextField(
        blank=True, verbose_name="Mô tả chi tiết năng lực ở mức độ này"
    )
    questions = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Bộ câu hỏi phỏng vấn (JSON list)",
    )
    documents = models.JSONField(
        default=list, blank=True, verbose_name="Tài liệu học tập (JSON list)"
    )

    class Meta:
        unique_together = ("skill", "level")
        verbose_name = "Chi tiết cấp độ kỹ năng"
        verbose_name_plural = "Chi tiết các cấp độ kỹ năng"

    def __str__(self):
        return f"{self.skill.name} - Mức độ {self.level}"
