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


class StudentProfile(models.Model):
    """Bảng lưu hồ sơ sinh viên 1-1 với User, hỗ trợ ghi đè khi phân tích CV mới."""

    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="student_profile",
        verbose_name="Tài khoản sinh viên",
    )

    profile_summary = models.TextField(
        blank=True,
        null=True,
        verbose_name="Tóm tắt hồ sơ (Summary)",
    )

    extracted_occupations = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Các vị trí nghề nghiệp trích xuất được",
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Thời gian cập nhật gần nhất",
    )

    class Meta:
        db_table = "student_profiles"
        verbose_name = "Hồ sơ sinh viên"
        verbose_name_plural = "Danh sách hồ sơ sinh viên"

    def __str__(self):
        return f"Hồ sơ: {self.user.username}"


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


class StudentSkill(models.Model):
    """Bảng trung gian lưu trữ kỹ năng của sinh viên, hỗ trợ ghi đè khi có kết quả phân tích mới."""

    class SkillLevel(models.TextChoices):
        FOUNDATION = "Foundation", "Nền tảng"
        APPLIED = "Applied", "Ứng dụng"
        PROFICIENT = "Proficient", "Thành thạo"
        ADVANCED = "Advanced", "Nâng cao / Chuyên gia"

    class SkillStatus(models.TextChoices):
        MATCHED = "matched", "Đã khớp"
        UNMATCHED = "unmatched", "Chưa khớp hệ thống"

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="student_skills",
        verbose_name="Hồ sơ sinh viên",
    )

    # Liên kết tới bảng Skill (có thể null nếu skill ở trạng thái unmatched chưa có trong hệ thống ESCO)
    skill = models.ForeignKey(
        Skill,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="student_mappings",
        verbose_name="Kỹ năng chuẩn",
    )

    level = models.CharField(
        max_length=50,
        choices=SkillLevel.choices,
        blank=True,
        null=True,
        verbose_name="Mức độ thành thạo",
    )

    reasoning = models.TextField(
        blank=True,
        null=True,
        verbose_name="Lý do đánh giá của AI",
    )

    evidence = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Các đoạn bằng chứng trong CV",
    )

    status = models.CharField(
        max_length=20,
        choices=SkillStatus.choices,
        default=SkillStatus.MATCHED,
        verbose_name="Trạng thái ánh xạ",
    )

    class Meta:
        db_table = "student_skills"
        verbose_name = "Kỹ năng sinh viên"
        verbose_name_plural = "Danh sách kỹ năng sinh viên"
        indexes = [
            models.Index(fields=["student_profile", "status"], name="student_skill_status_idx"),
        ]

    def __str__(self):
        return f"{self.student_profile.user.username} - {self.skill.name if self.skill else 'N/A'} ({self.level or 'N/A'})"


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


class AITaskLog(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Đang xử lý"
        SUCCESS = "SUCCESS", "Thành công"
        FAILED = "FAILED", "Thất bại"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ai_task_logs"
    )

    task_type = models.CharField(max_length=50, db_index=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )

    model_name = models.CharField(max_length=100, blank=True, null=True)

    input_payload = models.JSONField(default=dict, blank=True)

    step_artifacts = models.JSONField(default=dict, blank=True)

    output_payload = models.JSONField(default=dict, blank=True)

    metrics = models.JSONField(default=dict, blank=True)

    error_message = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "AI Task Log"
        verbose_name_plural = "AI Task Logs"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.task_type.upper()}] - {self.status} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
