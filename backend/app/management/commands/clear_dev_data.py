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
