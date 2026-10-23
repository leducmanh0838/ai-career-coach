import uuid

from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVector
from django.db import models
from pgvector.django import HnswIndex, VectorField


def generate_uuid():
    return str(uuid.uuid4())


class CustomUser(AbstractUser):
    """Custom User model for AI Career Coach."""

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
    """Bảng lưu trữ danh sách kỹ năng, kiến thức chuẩn."""

    id = models.CharField(
        max_length=500,
        primary_key=True,
        default=generate_uuid,
        verbose_name="Mã định danh (URI hoặc UUID)",
    )

    name = models.CharField(
        max_length=255,
        db_index=True,
        verbose_name="Tên kỹ năng (EN)",
    )

    skill_type = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Loại kỹ năng",
    )

    reuse_level = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Mức độ tái sử dụng",
    )

    synonyms = models.TextField(
        blank=True,
        null=True,
        verbose_name="Từ đồng nghĩa (EN)",
    )

    description = models.TextField(
        blank=True,
        null=True,
        verbose_name="Mô tả chi tiết (EN)",
    )

    name_vi = models.CharField(
        max_length=255,
        blank=True,
        default="",
        db_index=True,
        verbose_name="Tên kỹ năng (VI)",
    )

    synonyms_vi = models.TextField(
        blank=True,
        default="",
        verbose_name="Từ đồng nghĩa (VI)",
    )

    description_vi = models.TextField(
        blank=True,
        default="",
        verbose_name="Mô tả chi tiết (VI)",
    )

    is_verified = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name="Đã được xác thực bởi con người",
    )

    embedding = VectorField(
        dimensions=1536,
        null=True,
        blank=True,
        verbose_name="Vector Embedding",
    )

    def __str__(self):
        return self.name_vi or self.name

    class Meta:
        indexes = [
            HnswIndex(
                fields=["embedding"],
                name="skill_embedding_hnsw_idx",
                m=16,
                ef_construction=64,
                opclasses=["vector_cosine_ops"],
            ),
            GinIndex(
                SearchVector(
                    "name",
                    "synonyms",
                    config="simple",
                ),
                name="skill_fulltext_idx",
            ),
        ]


class Occupation(models.Model):
    """Bảng lưu trữ danh sách nghề nghiệp chuẩn."""

    id = models.CharField(
        max_length=500,
        primary_key=True,
        default=generate_uuid,
        verbose_name="Mã định danh (URI hoặc UUID)",
    )

    code = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        db_index=True,
        verbose_name="Mã nghề nghiệp",
    )

    # Dữ liệu gốc từ ESCO
    name = models.CharField(
        max_length=255,
        db_index=True,
        verbose_name="Tên nghề nghiệp (EN)",
    )

    synonyms = models.TextField(
        blank=True,
        null=True,
        verbose_name="Tên gọi khác (EN)",
    )

    description = models.TextField(
        blank=True,
        null=True,
        verbose_name="Mô tả công việc (EN)",
    )

    # Dữ liệu tiếng Việt do hệ thống dịch/bổ sung
    name_vi = models.CharField(
        max_length=255,
        blank=True,
        default="",
        db_index=True,
        verbose_name="Tên nghề nghiệp (VI)",
    )

    synonyms_vi = models.TextField(
        blank=True,
        default="",
        verbose_name="Tên gọi khác (VI)",
    )

    description_vi = models.TextField(
        blank=True,
        default="",
        verbose_name="Mô tả công việc (VI)",
    )

    is_verified = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name="Đã được xác thực bởi con người",
    )

    embedding = VectorField(
        dimensions=1536,
        null=True,
        blank=True,
        verbose_name="Vector Embedding",
    )

    def __str__(self):
        return self.name_vi or self.name

    class Meta:
        indexes = [
            HnswIndex(
                fields=["embedding"],
                name="occ_embedding_hnsw_idx",
                m=16,
                ef_construction=64,
                opclasses=["vector_cosine_ops"],
            ),
            GinIndex(
                SearchVector(
                    "name",
                    "synonyms",
                    config="simple",
                ),
                name="occ_fulltext_idx",
            ),
        ]


class OccupationSkillRelation(models.Model):
    """Bảng trung gian ánh xạ nghề nghiệp với kỹ năng."""

    occupation = models.ForeignKey(
        Occupation,
        on_delete=models.CASCADE,
        related_name="required_skills",
        verbose_name="Nghề nghiệp",
    )

    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="required_by_occupations",
        verbose_name="Kỹ năng yêu cầu",
    )

    relation_type = models.CharField(
        max_length=50,
        verbose_name="Loại quan hệ (Bắt buộc/Tùy chọn)",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["occupation", "skill", "relation_type"],
                name="uniq_occupation_skill_relation",
            ),
        ]

    def __str__(self):
        return (
            f"{self.occupation.name} -> "
            f"{self.skill.name} ({self.relation_type})"
        )


class SkillDependency(models.Model):
    """Bảng lưu quan hệ giữa các kỹ năng."""

    source_skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="outgoing_relations",
        verbose_name="Kỹ năng gốc",
    )

    related_skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="incoming_relations",
        verbose_name="Kỹ năng liên quan",
    )

    relation_type = models.CharField(
        max_length=50,
        verbose_name="Loại quan hệ kỹ năng",
    )

    def __str__(self):
        return (
            f"{self.source_skill.name} relates to "
            f"{self.related_skill.name}"
        )
