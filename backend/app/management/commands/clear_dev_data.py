
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from app.models import (
    Skill,
    Occupation,
    OccupationSkillRelation,
    SkillDependency,
)


class Command(BaseCommand):
    help = "Xóa dữ liệu ESCO để phục vụ phát triển và kiểm thử."

    def add_arguments(self, parser):
        parser.add_argument(
            "--confirm",
            action="store_true",
            help="Xác nhận xóa dữ liệu thực sự.",
        )

    def handle(self, *args, **options):
        # Không cho phép sử dụng command khi DEBUG=False.
        if not settings.DEBUG:
            raise CommandError(
                "Command này chỉ được phép chạy khi DEBUG=True."
            )

        # Xóa bảng quan hệ trước, bảng dữ liệu chính sau.
        models_to_clear = [
            ("SkillDependency", SkillDependency),
            ("OccupationSkillRelation", OccupationSkillRelation),
            ("Skill", Skill),
            ("Occupation", Occupation),
        ]

        self.stdout.write("Kiểm tra dữ liệu cần xóa:\n")

        for label, model in models_to_clear:
            self.stdout.write(
                f"  {label}: {model.objects.count():,} bản ghi"
            )

        # Mặc định chỉ xem trước, không xóa.
        if not options["confirm"]:
            self.stdout.write(
                self.style.WARNING(
                    "\nChưa xóa dữ liệu. "
                    "Thêm --confirm để thực hiện."
                )
            )
            return

        try:
            with transaction.atomic():
                total_deleted = 0

                for label, model in models_to_clear:
                    deleted_count, details = (
                        model.objects.all().delete()
                    )

                    total_deleted += deleted_count

                    self.stdout.write(
                        f"Đã xóa {label}: "
                        f"{deleted_count:,} bản ghi "
                        "(bao gồm các bản ghi liên quan nếu có)."
                    )

        except Exception as exc:
            raise CommandError(
                f"Xóa dữ liệu thất bại; transaction đã rollback: {exc}"
            ) from exc

        self.stdout.write(
            self.style.SUCCESS(
                f"\nHoàn tất. Tổng số bản ghi bị xóa: "
                f"{total_deleted:,}."
            )
        )
