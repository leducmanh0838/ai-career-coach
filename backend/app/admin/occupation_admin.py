from django.contrib import admin
from django.utils.html import format_html
from app.models import Occupation, OccupationSkillRelation


class OccupationSkillRelationInline(admin.TabularInline):
    """
    Cho phép thêm/sửa/xóa các kỹ năng yêu cầu trực tiếp
    ngay bên dưới trang chi tiết của Nghề nghiệp.
    """
    model = OccupationSkillRelation
    fk_name = 'occupation'
    extra = 1
    autocomplete_fields = ['skill']  # Tìm kiếm thông minh qua Ajax


@admin.register(Occupation)
class OccupationAdmin(admin.ModelAdmin):
    list_display = (
        'get_occupation_display',
        'code',
        'is_verified'
    )

    @admin.display(description="Nghề nghiệp (EN / VI)", ordering='name')
    def get_occupation_display(self, obj):
        return str(obj)

    list_filter = (
        'is_verified',
    )
    search_fields = (
        'name',
        'name_vi',
        'code',
        'synonyms',
        'synonyms_vi',
        'id'
    )

    inlines = [OccupationSkillRelationInline]

    fieldsets = (
        ("Thông tin Tiếng Việt (Hiển thị chính)", {
            "fields": ("name_vi", "synonyms_vi", "description_vi")
        }),
        ("Thông tin Tiếng Anh & Metadata gốc", {
            "fields": ("id", "code", "name", "synonyms", "description")
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
        # Giới hạn chiều cao tương đương ~3 dòng, có thanh cuộn dọc
        return format_html(
            '<div style="max-height: 4.5em; overflow-y: auto; padding: 6px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; font-family: monospace; white-space: pre-wrap;">{}</div>',
            str(obj.embedding)
        )


@admin.register(OccupationSkillRelation)
class OccupationSkillRelationAdmin(admin.ModelAdmin):
    """Trang quản lý riêng lẻ cho bảng trung gian quan hệ."""
    list_display = ('occupation', 'relation_type', 'skill')
    list_filter = ('relation_type',)
    search_fields = (
        'occupation__name',
        'occupation__name_vi',
        'skill__name',
        'skill__name_vi'
    )
    autocomplete_fields = ['occupation', 'skill']