import json

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.safestring import mark_safe

from .models import CustomUser, AITaskLog


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = (
        "username",
        "email",
        "role",
        "phone_number",
        "is_staff",
        "is_active",
    )
    list_filter = ("role", "is_staff", "is_active")
    search_fields = ("username", "email", "phone_number")

    fieldsets = UserAdmin.fieldsets + (
        (
            "Thông tin bổ sung",
            {
                "fields": ("role", "phone_number", "avatar_url"),
            },
        ),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "Thông tin bổ sung",
            {
                "fields": ("role", "phone_number", "avatar_url"),
            },
        ),
    )


@admin.register(AITaskLog)
class AITaskLogAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "task_type",
        "status_colored",
        "model_name",
        "created_at",
    )
    list_filter = ("status", "task_type", "model_name", "created_at")
    search_fields = ("id", "task_type", "model_name", "user__username", "user__email")

    # Vì đây là log hệ thống (audit log), nên để read-only để tránh chỉnh sửa nhầm
    readonly_fields = (
        "id",
        "user",
        "task_type",
        "status",
        "model_name",
        "formatted_input_payload",
        "formatted_step_artifacts",
        "formatted_output_payload",
        "formatted_metrics",
        "error_message",
        "created_at",
        "updated_at",
    )

    # Chia bố cục các tab/section cho gọn gàng
    fieldsets = (
        ("Thông tin tổng quan", {
            "fields": ("id", "user", "task_type", "status", "model_name", "created_at", "updated_at")
        }),
        ("Dữ liệu đầu vào (Input Payload)", {
            "fields": ("formatted_input_payload",),
        }),
        ("Vết các bước thực hiện (Step Artifacts)", {
            "fields": ("formatted_step_artifacts",),
            "classes": ("collapse",),  # Mặc định thu gọn lại vì dữ liệu này rất dài
        }),
        ("Kết quả cuối cùng (Output Payload)", {
            "fields": ("formatted_output_payload",),
        }),
        ("Hiệu năng, Token & Lỗi", {
            "fields": ("formatted_metrics", "error_message"),
        }),
    )

    def _format_json(self, data):
        """Hàm helper chuyển đổi dict/JSON thành HTML <pre> hiển thị đẹp mắt"""
        if not data:
            return "-"
        formatted = json.dumps(data, ensure_ascii=False, indent=2)
        return mark_safe(
            f'<pre style="background: #1e1e1e; color: #dcdcdc; padding: 12px; '
            f'border-radius: 6px; font-family: Consolas, monospace; font-size: 13px; '
            f'max-height: 400px; overflow: auto;">{formatted}</pre>'
        )

    def formatted_input_payload(self, obj):
        return self._format_json(obj.input_payload)

    formatted_input_payload.short_description = "Input Payload"

    def formatted_step_artifacts(self, obj):
        return self._format_json(obj.step_artifacts)

    formatted_step_artifacts.short_description = "Step Artifacts (Tracks)"

    def formatted_output_payload(self, obj):
        return self._format_json(obj.output_payload)

    formatted_output_payload.short_description = "Output Payload"

    def formatted_metrics(self, obj):
        return self._format_json(obj.metrics)

    formatted_metrics.short_description = "Metrics (Time & Tokens)"

    def status_colored(self, obj):
        """Tô màu trực quan cho trạng thái"""
        colors = {
            "SUCCESS": "#28a745",  # Xanh lá
            "PENDING": "#ffc107",  # Vàng
            "FAILED": "#dc3545",  # Đỏ
        }
        color = colors.get(obj.status, "#6c757d")
        return mark_safe(f'<strong style="color: {color};">{obj.get_status_display()}</strong>')

    status_colored.short_description = "Trạng thái"
