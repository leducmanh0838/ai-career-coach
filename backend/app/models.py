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

import uuid

from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVector
from django.db import models
from pgvector.django import HnswIndex, VectorField

from app.services.embedding_service import get_embedding_vector


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


class SkillLevel(models.TextChoices):
    FOUNDATION = "Foundation", "Nền tảng"
    APPLIED = "Applied", "Ứng dụng"
    PROFICIENT = "Proficient", "Thành thạo"
    ADVANCED = "Advanced", "Nâng cao / Chuyên gia"


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
        verbose_name="Đã được xác thực",
    )

    embedding = VectorField(
        dimensions=1536,
        null=True,
        blank=True,
        verbose_name="Vector Embedding",
    )

    def save(self, *args, **kwargs):
        # Tự động sinh vector nếu chưa có
        if not self.embedding:
            combined_text = f"{self.name}"

            try:
                self.embedding = get_embedding_vector(combined_text)
            except Exception as e:
                print(f"Lỗi khi sinh embedding: {e}")

        super().save(*args, **kwargs)

    def __str__(self):
        name_en = self.name.strip() if self.name else ""
        name_vi = self.name_vi.strip() if self.name_vi else ""

        if name_vi and name_vi.lower() != name_en.lower():
            return f"{name_en} ({name_vi})"
        return name_en

    class Meta:
        indexes = [
            HnswIndex(
                fields=["embedding"],
                name="skill_embedding_hnsw_idx",
                m=16,
                ef_construction=64,
                opclasses=["vector_cosine_ops"],
            ),
            # Index Full-Text Search cho Tiếng Anh (Đã có sẵn của bạn)
            GinIndex(
                SearchVector("name", "synonyms", config="simple"),
                name="skill_fulltext_idx",
            ),
            # Bổ sung thêm Index Full-Text Search cho Tiếng Việt
            GinIndex(
                SearchVector("name_vi", "synonyms_vi", config="simple"),
                name="skill_fulltext_vi_idx",
            ),
        ]

        verbose_name = "Kỹ năng"
        verbose_name_plural = "Quản lý kỹ năng"


class StudentSkill(models.Model):
    """Lưu trữ kỹ năng của sinh viên được phân tích từ CV."""

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="student_skills",
        verbose_name="Hồ sơ sinh viên",
    )

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
        default="",
        verbose_name="Lý do đánh giá của AI",
    )

    evidence = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Các đoạn bằng chứng trong CV",
    )

    class Meta:
        db_table = "student_skills"
        verbose_name = "Kỹ năng sinh viên"
        verbose_name_plural = "Danh sách kỹ năng sinh viên"
        indexes = [
            models.Index(
                fields=["student_profile"],
                name="student_skill_profile_idx",
            ),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["student_profile", "skill"],
                name="uniq_student_profile_skill",
            ),
        ]

    def __str__(self):
        skill_name = self.skill.name if self.skill else "Chưa xác định"
        return (
            f"{self.student_profile.user.username} - "
            f"{skill_name} ({self.level or 'Chưa đánh giá'})"
        )


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

    def save(self, *args, **kwargs):
        if not self.embedding:
            combined_text = f"{self.name}"

            try:
                self.embedding = get_embedding_vector(combined_text)
            except Exception as e:
                print(f"Lỗi khi sinh embedding: {e}")

        super().save(*args, **kwargs)

    def __str__(self):
        name_en = self.name.strip() if self.name else ""
        name_vi = self.name_vi.strip() if self.name_vi else ""

        # Nếu có name_vi, không rỗng và khác name_en thì gộp chung trong ngoặc
        if name_vi and name_vi.lower() != name_en.lower():
            return f"{name_en} ({name_vi})"
        return name_en

    class Meta:
        verbose_name = "Nghề nghiệp"
        verbose_name_plural = "Quản lý nghề nghiệp"
        indexes = [
            HnswIndex(
                fields=["embedding"],
                name="occ_embedding_hnsw_idx",
                m=16,
                ef_construction=64,
                opclasses=["vector_cosine_ops"],
            ),
            GinIndex(
                SearchVector("name", "synonyms", config="simple"),
                name="occ_fulltext_idx",
            ),
            # Bổ sung Full-Text Search cho Tiếng Việt
            GinIndex(
                SearchVector("name_vi", "synonyms_vi", config="simple"),
                name="occ_fulltext_vi_idx",
            ),
        ]


class OccupationSkillRelation(models.Model):
    """Bảng trung gian ánh xạ nghề nghiệp với kỹ năng."""

    class OccupationRelationType(models.TextChoices):
        """Loại quan hệ giữa nghề nghiệp và kỹ năng chuẩn."""
        ESSENTIAL = "essential", "Bắt buộc (Essential)"
        OPTIONAL = "optional", "Tùy chọn (Optional)"

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
        choices=OccupationRelationType.choices,
        default=OccupationRelationType.ESSENTIAL,
        verbose_name="Loại quan hệ",
    )

    class Meta:
        verbose_name = "Quan hệ Nghề nghiệp - Kỹ năng"
        verbose_name_plural = "Quản lý quan hệ Nghề nghiệp - Kỹ năng"
        constraints = [
            models.UniqueConstraint(
                fields=["occupation", "skill", "relation_type"],
                name="uniq_occupation_skill_relation",
            ),
        ]

    def __str__(self):
        relation_label = self.get_relation_type_display()
        occ_name = self.occupation.name
        skill_name = self.skill.name
        return f"{occ_name} ──[{relation_label}]──> {skill_name}"


class SkillDependency(models.Model):
    """Bảng lưu quan hệ giữa các kỹ năng."""

    class SkillRelationType(models.TextChoices):
        """Hai loại quan hệ kỹ năng chính."""
        ESSENTIAL = "essential", "Bắt buộc (Essential)"
        OPTIONAL = "optional", "Tùy chọn (Optional)"

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
        choices=SkillRelationType.choices,
        default=SkillRelationType.ESSENTIAL,
        verbose_name="Loại quan hệ kỹ năng",
    )

    def __str__(self):
        relation_label = self.get_relation_type_display()
        source_name = self.source_skill.name_vi or self.source_skill.name
        target_name = self.related_skill.name_vi or self.related_skill.name
        return f"{source_name} ──[{relation_label}]──> {target_name}"

    class Meta:
        verbose_name = "Quan hệ kỹ năng"
        verbose_name_plural = "Quản lý quan hệ kỹ năng"


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


class JobPosting(models.Model):
    """Tin tuyển dụng do nhà tuyển dụng đăng."""

    class Status(models.TextChoices):
        DRAFT = "draft", "Bản nháp"
        PUBLISHED = "published", "Đang tuyển"
        CLOSED = "closed", "Đã đóng"

    recruiter = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="job_postings",
        limit_choices_to={"role": "recruiter"},
        verbose_name="Nhà tuyển dụng",
    )
    title = models.CharField(max_length=255, verbose_name="Tiêu đề")
    description = models.TextField(verbose_name="Mô tả công việc")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
        verbose_name="Trạng thái",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "job_postings"
        ordering = ["-created_at"]
        verbose_name = "Tin tuyển dụng"
        verbose_name_plural = "Danh sách tin tuyển dụng"

    def __str__(self):
        return self.title


class JobRequiredSkill(models.Model):
    """Kỹ năng yêu cầu của tin tuyển dụng, được trích xuất từ JD."""

    job = models.ForeignKey(
        JobPosting,
        on_delete=models.CASCADE,
        related_name="required_skills",
        verbose_name="Tin tuyển dụng",
    )

    # Có thể null nếu AI chưa ánh xạ được kỹ năng vào ESCO.
    skill = models.ForeignKey(
        Skill,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="job_mappings",
        verbose_name="Kỹ năng chuẩn",
    )

    level = models.CharField(
        max_length=50,
        choices=SkillLevel.choices,
        blank=True,
        null=True,
        verbose_name="Mức độ yêu cầu",
    )

    reasoning = models.TextField(
        blank=True,
        null=True,
        verbose_name="Lý do AI đánh giá",
    )

    evidence = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Các đoạn bằng chứng trong JD",
    )

    class Meta:
        db_table = "job_required_skills"
        verbose_name = "Kỹ năng yêu cầu"
        verbose_name_plural = "Danh sách kỹ năng yêu cầu"
        indexes = [
            models.Index(
                fields=["job", "skill"],
                name="job_required_skill_idx",
            ),
        ]

    def __str__(self):
        return (
            f"{self.job.title} - "
            f"{self.skill.name if self.skill else 'N/A'} "
            f"({self.level or 'N/A'})"
        )


class LearningResource(models.Model):
    """Tài liệu & định hướng ôn tập phân chia theo Cấp độ Kỹ năng."""

    id = models.CharField(
        max_length=500,
        primary_key=True,
        default=generate_uuid,
        verbose_name="Mã định danh",
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="learning_resources",
        verbose_name="Kỹ năng liên quan",
    )
    level = models.CharField(
        max_length=20,
        choices=SkillLevel.choices,
        default=SkillLevel.FOUNDATION,
        verbose_name="Cấp độ năng lực",
        db_index=True,  # Đánh index riêng cho level nếu cần lọc độc lập
    )
    title = models.CharField(
        max_length=255,
        verbose_name="Tiêu đề tài liệu / Chủ đề học",
    )
    url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name="Đường dẫn tham khảo (URL)",
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name="Nội dung cần đạt ở level này",
    )

    class Meta:
        verbose_name = "Tài liệu học tập"
        verbose_name_plural = "Quản lý tài liệu học tập"
        indexes = [
            # Đánh chỉ mục kết hợp (Composite Index) cho cả skill và level
            models.Index(fields=["skill", "level"], name="learning_res_skill_level_idx"),
        ]

    def __str__(self):
        return f"[{self.skill.name} - {self.get_level_display()}] {self.title}"


class InterviewQuestion(models.Model):
    """Bộ câu hỏi phỏng vấn phân chia theo Cấp độ Kỹ năng."""

    id = models.CharField(
        max_length=500,
        primary_key=True,
        default=generate_uuid,
        verbose_name="Mã định danh",
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="interview_questions",
        verbose_name="Kỹ năng liên quan",
    )
    level = models.CharField(
        max_length=20,
        choices=SkillLevel.choices,
        default=SkillLevel.FOUNDATION,
        verbose_name="Cấp độ câu hỏi",
        db_index=True,
    )
    question_text = models.TextField(
        verbose_name="Nội dung câu hỏi phỏng vấn",
    )
    sample_answer = models.TextField(
        blank=True,
        null=True,
        verbose_name="Gợi ý câu trả lời / Ý chính cần đạt",
    )

    class Meta:
        verbose_name = "Câu hỏi phỏng vấn"
        verbose_name_plural = "Quản lý câu hỏi phỏng vấn"
        indexes = [
            # Đánh chỉ mục kết hợp cho cả skill và level
            models.Index(fields=["skill", "level"], name="interview_ques_skill_level_idx"),
        ]

    def __str__(self):
        target = self.skill.name if self.skill else "General"
        return f"[{target} - {self.get_level_display()}] {self.question_text[:50]}..."


class JobApplication(models.Model):
    """Quản lý việc sinh viên ứng tuyển vào tin tuyển dụng và kết quả đánh giá khoảng cách kỹ năng."""

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="applications",
        verbose_name="Hồ sơ sinh viên",
    )
    job_posting = models.ForeignKey(
        JobPosting,
        on_delete=models.CASCADE,
        related_name="applications",
        verbose_name="Tin tuyển dụng",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Thời gian ứng tuyển")

    class Meta:
        db_table = "job_applications"
        unique_together = ("student_profile", "job_posting")
        verbose_name = "Đơn ứng tuyển"
        verbose_name_plural = "Danh sách đơn ứng tuyển"

    def __str__(self):
        return f"{self.student_profile.user.username} - {self.job_posting.title}"


class PersonalizedRoadmap(models.Model):
    """Lộ trình học tập cá nhân hóa cho sinh viên đối với một job cụ thể."""
    application = models.ForeignKey(
        JobApplication,
        on_delete=models.CASCADE,
        related_name="roadmaps",
        verbose_name="Đơn ứng tuyển liên quan",
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        verbose_name="Kỹ năng cần bổ sung",
    )
    target_level = models.CharField(
        max_length=50,
        choices=SkillLevel.choices,
        verbose_name="Cấp độ mục tiêu",
    )

    class Meta:
        db_table = "personalized_roadmaps"
        verbose_name = "Lộ trình học tập cá nhân"
        verbose_name_plural = "Danh sách lộ trình học tập cá nhân"

    def __str__(self):
        return f"Lộ trình: {self.skill.name}"
