from django.contrib import admin
from django import forms
from django.utils.html import format_html
from django.db import models

from app.models import (
    Skill,
    SkillDependency,
    LearningResource,
    InterviewQuestion
)


class SkillDependencyInline(admin.TabularInline):
    """Quản lý kỹ năng phụ thuộc ngay trong trang chi tiết Kỹ năng."""
    model = SkillDependency
    fk_name = 'source_skill'
    extra = 1
    autocomplete_fields = ['related_skill']


class LearningResourceInline(admin.TabularInline):
    """Quản lý tài liệu học tập phân theo cấp độ ngay trong trang chi tiết Kỹ năng."""
    model = LearningResource
    extra = 1
    fields = ('level', 'title', 'url', 'description')
    ordering = ('level',)
    formfield_overrides = {
        models.TextField: {'widget': forms.Textarea(attrs={'rows': 2, 'cols': 30})},
    }


class InterviewQuestionInline(admin.TabularInline):
    """Quản lý câu hỏi phỏng vấn phân theo cấp độ ngay trong trang chi tiết Kỹ năng."""
    model = InterviewQuestion
    extra = 1
    fields = ('level', 'question_text', 'sample_answer')
    ordering = ('level',)
    # Thu nhỏ các ô câu hỏi và gợi ý trả lời lại
    formfield_overrides = {
        models.TextField: {'widget': forms.Textarea(attrs={'rows': 2, 'cols': 30})},
    }


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = (
        'get_skill_display',
        'skill_type',
        'is_verified'
    )

    @admin.display(description="Kỹ năng (EN / VI)", ordering='name')
    def get_skill_display(self, obj):
        return str(obj)

    list_filter = (
        'is_verified',
        'skill_type',
    )
    search_fields = (
        'name',
        'name_vi',
        'synonyms',
        'synonyms_vi',
        'id'
    )

    # Tích hợp cả 3 Inlines vào trang chi tiết Kỹ năng
    inlines = [
        SkillDependencyInline,
        LearningResourceInline,
        InterviewQuestionInline,
    ]

    fieldsets = (
        ("Thông tin Tiếng Việt (Hiển thị chính)", {
            "fields": ("name_vi", "synonyms_vi", "description_vi")
        }),
        ("Thông tin Tiếng Anh & Metadata gốc", {
            "fields": ("id", "name", "skill_type", "synonyms", "description")
        }),
        ("Trạng thái & AI Vector", {
            "fields": ("is_verified", "get_embedding_display"),
            "classes": ("collapse",),
        }),
    )

    readonly_fields = ('get_embedding_display',)

    @admin.display(description="Vector Embedding")
    def get_embedding_display(self, obj):
        if not obj.embedding:
            return "Trống"
        return format_html(
            '<div style="max-height: 4.5em; overflow-y: auto; padding: 6px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; font-family: monospace; white-space: pre-wrap;">{}</div>',
            str(obj.embedding)
        )


@admin.register(SkillDependency)
class SkillDependencyAdmin(admin.ModelAdmin):
    list_display = ('source_skill', 'relation_type', 'related_skill')
    list_filter = ('relation_type',)
    search_fields = (
        'source_skill__name',
        'source_skill__name_vi',
        'related_skill__name',
        'related_skill__name_vi'
    )
    autocomplete_fields = ['source_skill', 'related_skill']


# @admin.register(LearningResource)
# class LearningResourceAdmin(admin.ModelAdmin):
#     list_display = ('title', 'skill', 'level', 'url')
#     list_filter = ('level', 'skill')
#     search_fields = ('title', 'skill__name', 'description')
#     autocomplete_fields = ['skill']
#
#
# @admin.register(InterviewQuestion)
# class InterviewQuestionAdmin(admin.ModelAdmin):
#     list_display = ('question_text', 'skill', 'level')
#     list_filter = ('level', 'skill')
#     search_fields = ('question_text', 'sample_answer', 'skill__name')
#     autocomplete_fields = ['skill']