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

import json
from itertools import islice
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from app.models import (
    Skill,
    Occupation,
    OccupationSkillRelation,
    SkillDependency,
)

BATCH_SIZE = 1000

# Thứ tự quan trọng: bảng được tham chiếu phải được import trước.
MODEL_CONFIG = [
    ("skills", Skill, None),
    ("occupations", Occupation, None),
    (
        "occupation_skill_relations",
        OccupationSkillRelation,
        ("occupation_id", "skill_id", "relation_type"),
    ),
    (
        "skill_dependencies",
        SkillDependency,
        ("source_skill_id", "related_skill_id", "relation_type"),
    ),
]


def chunks(items, size=BATCH_SIZE):
    iterator = iter(items)

    while batch := list(islice(iterator, size)):
        yield batch


class Command(BaseCommand):
    help = "Import bốn bảng ESCO từ file JSON"

    def add_arguments(self, parser):
        parser.add_argument(
            "--input",
            type=Path,
            default=(
                Path(settings.BASE_DIR)
                / "data"
                / "data.json"
            ),
            help="Đường dẫn file JSON đầu vào",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        input_path = options["input"].resolve()

        if not input_path.is_file():
            raise CommandError(
                f"Không tìm thấy file JSON: {input_path}"
            )

        try:
            with input_path.open("r", encoding="utf-8") as file:
                data = json.load(file)
        except (OSError, UnicodeError, json.JSONDecodeError) as exc:
            raise CommandError(
                f"Không thể đọc file JSON: {exc}"
            ) from exc

        if not isinstance(data, dict):
            raise CommandError("JSON phải là một object.")

        if data.get("format_version") != 1:
            raise CommandError(
                "format_version không hợp lệ hoặc chưa được hỗ trợ."
            )

        model_data = data.get("models")

        if not isinstance(model_data, dict):
            raise CommandError("JSON thiếu object 'models'.")

        # Yêu cầu đủ bốn nhóm, kể cả khi một nhóm không có dữ liệu.
        for label, _, _ in MODEL_CONFIG:
            if not isinstance(model_data.get(label), list):
                raise CommandError(
                    f"models.{label} phải là một danh sách JSON."
                )

        self.stdout.write(f"Đọc dữ liệu từ: {input_path}")

        for label, model, key_fields in MODEL_CONFIG:
            rows = model_data[label]
            total = len(rows)
            created = 0
            skipped = 0
            processed = 0

            self.stdout.write(
                f"\nImport {label}: tổng {total:,} bản ghi..."
            )

            # Chia batch để giới hạn số object xử lý cùng lúc.
            for batch in chunks(rows):
                objects_by_key = {}

                try:
                    allowed_fields = {
                        field.attname
                        for field in model._meta.concrete_fields
                    }

                    for row in batch:
                        if not isinstance(row, dict):
                            raise ValueError(
                                "Mỗi bản ghi phải là một JSON object."
                            )

                        unknown_fields = set(row) - allowed_fields

                        if unknown_fields:
                            raise ValueError(
                                "Field không hợp lệ: "
                                + ", ".join(sorted(unknown_fields))
                            )

                        obj = model(**row)

                        if key_fields is None:
                            # Skill và Occupation: khóa chính là ID.
                            objects_by_key.setdefault(obj.pk, obj)
                        else:
                            # Hai bảng quan hệ: dùng khóa ghép.
                            key = tuple(
                                getattr(obj, field)
                                for field in key_fields
                            )
                            objects_by_key.setdefault(key, obj)

                except (TypeError, ValueError) as exc:
                    raise CommandError(
                        f"Dữ liệu trong nhóm {label} không hợp lệ "
                        f"gần bản ghi {processed + 1}: {exc}"
                    ) from exc

                objects = list(objects_by_key.values())

                if key_fields is None:
                    ids = [obj.pk for obj in objects]

                    existing_keys = set(
                        model.objects.filter(
                            pk__in=ids
                        ).values_list("pk", flat=True)
                    )

                elif objects:
                    first, second, third = key_fields

                    # Tìm các khóa ghép đã tồn tại trong database.
                    existing_rows = model.objects.filter(
                        **{
                            f"{first}__in": list({
                                getattr(obj, first)
                                for obj in objects
                            }),
                            f"{second}__in": list({
                                getattr(obj, second)
                                for obj in objects
                            }),
                            f"{third}__in": list({
                                getattr(obj, third)
                                for obj in objects
                            }),
                        }
                    ).values_list(first, second, third)

                    existing_keys = set(existing_rows)

                else:
                    existing_keys = set()

                to_create = [
                    obj
                    for key, obj in objects_by_key.items()
                    if key not in existing_keys
                ]

                skipped += len(objects) - len(to_create)

                try:
                    if to_create:
                        model.objects.bulk_create(
                            to_create,
                            batch_size=BATCH_SIZE,
                        )
                except Exception as exc:
                    raise CommandError(
                        f"Lỗi import {label}, "
                        f"batch kết thúc tại bản ghi "
                        f"{processed + len(batch)}: {exc}"
                    ) from exc

                created += len(to_create)
                processed += len(batch)

                percent = (
                    processed / total * 100
                    if total
                    else 100
                )

                self.stdout.write(
                    f"{label}: {processed:,}/{total:,} "
                    f"({percent:.1f}%) | "
                    f"tạo {created:,} | bỏ qua {skipped:,}"
                )

            self.stdout.write(
                self.style.SUCCESS(
                    f"{label} hoàn tất: "
                    f"tạo {created:,}, bỏ qua {skipped:,}"
                )
            )

        self.stdout.write(
            self.style.SUCCESS(
                "\nImport toàn bộ dữ liệu ESCO hoàn tất."
            )
        )
