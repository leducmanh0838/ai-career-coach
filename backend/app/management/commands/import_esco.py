import csv
from itertools import islice
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import IntegrityError, transaction

from app.models import (
    Skill,
    Occupation,
    OccupationSkillRelation,
    SkillDependency,
)

BATCH_SIZE = 1000


def count_csv_rows(file_path):
    """Đếm tổng số dòng trong file CSV (trừ header) để tính tiến độ."""
    with file_path.open("r", encoding="utf-8-sig", newline="") as file:
        return sum(1 for _ in file) - 1


def read_csv(file_path):
    """Đọc CSV UTF-8, hỗ trợ BOM và trường có nhiều dòng."""
    if not file_path.is_file():
        raise CommandError(f"Không tìm thấy file CSV: {file_path}")

    try:
        with file_path.open(
                "r",
                encoding="utf-8-sig",
                newline="",
        ) as file:
            reader = csv.DictReader(file)

            if not reader.fieldnames:
                raise CommandError(f"File CSV rỗng hoặc thiếu header: {file_path}")

            for row_number, row in enumerate(reader, start=2):
                yield row_number, row

    except (UnicodeError, csv.Error) as exc:
        raise CommandError(
            f"Lỗi đọc CSV {file_path}: {exc}"
        ) from exc


def clean(value):
    value = (value or "").strip()
    return value or None


def combine_labels(*values):
    labels = []
    seen = set()

    for value in values:
        for label in (value or "").splitlines():
            label = label.strip()
            key = label.casefold()

            if label and key not in seen:
                labels.append(label)
                seen.add(key)

    return "\n".join(labels) or None


def batches(iterable, size=BATCH_SIZE):
    """Chia iterator thành các batch, không tải toàn bộ CSV vào RAM."""
    iterator = iter(iterable)

    while batch := list(islice(iterator, size)):
        yield batch


def unique_by_id(objects):
    """Bỏ ID trùng nhau trong cùng batch."""
    result = {}
    for obj in objects:
        result.setdefault(obj.id, obj)
    return list(result.values())


def import_entities(model, file_path, build_object, label, stdout):
    """
    Chỉ thêm bản ghi chưa tồn tại có kèm thanh tiến độ.
    """
    total_rows = count_csv_rows(file_path)
    created = 0
    skipped = 0
    processed = 0

    stdout.write(f"Đang import {label} (Tổng: {total_rows:,} dòng)...")

    # Sử dụng progress bar chuẩn của Django
    progress_bar = stdout.progress_bar(total_rows) if hasattr(stdout, "progress_bar") else None

    for batch in batches(read_csv(file_path)):
        objects = []
        first_line = batch[0][0]
        last_line = batch[-1][0]

        for row_number, row in batch:
            try:
                obj = build_object(row)
            except Exception as exc:
                raise CommandError(
                    f"{label}, dòng CSV {row_number}: {exc}"
                ) from exc

            if obj is not None:
                objects.append(obj)

        objects = unique_by_id(objects)

        ids = [obj.id for obj in objects]
        existing_ids = set(
            model.objects.filter(id__in=ids).values_list("id", flat=True)
        )

        to_create = [
            obj for obj in objects
            if obj.id not in existing_ids
        ]

        skipped += len(objects) - len(to_create)

        try:
            model.objects.bulk_create(
                to_create,
                batch_size=BATCH_SIZE,
            )
        except Exception as exc:
            raise CommandError(
                f"Lỗi import {label}, khoảng dòng "
                f"{first_line}-{last_line}: {exc}"
            ) from exc

        created += len(to_create)
        processed += len(batch)

        if progress_bar:
            progress_bar.update(len(batch))
        else:
            stdout.write(f"\r{label}: Đã xử lý {processed:,}/{total_rows:,} dòng", ending="")
            stdout.flush()

    if progress_bar:
        progress_bar.close()
    else:
        stdout.write("")

    stdout.write(
        f"✔ {label}: tạo {created:,}, bỏ qua {skipped:,}"
    )


def import_relations(
        model,
        file_path,
        build_object,
        key_fields,
        label,
        stdout,
):
    """
    Chỉ thêm quan hệ chưa tồn tại có kèm thanh tiến độ.
    """
    total_rows = count_csv_rows(file_path)
    created = 0
    skipped = 0
    processed = 0

    stdout.write(f"Đang import {label} (Tổng: {total_rows:,} dòng)...")
    progress_bar = stdout.progress_bar(total_rows) if hasattr(stdout, "progress_bar") else None

    for batch in batches(read_csv(file_path)):
        first_line = batch[0][0]
        last_line = batch[-1][0]
        objects_by_key = {}

        for row_number, row in batch:
            try:
                obj = build_object(row)
            except Exception as exc:
                raise CommandError(
                    f"{label}, dòng CSV {row_number}: {exc}"
                ) from exc

            if obj is None:
                continue

            key = tuple(getattr(obj, field) for field in key_fields)
            objects_by_key.setdefault(key, obj)

        objects = list(objects_by_key.values())

        if objects:
            first_field, second_field, third_field = key_fields

            existing_rows = model.objects.filter(
                **{
                    f"{first_field}__in": list({
                        getattr(obj, first_field) for obj in objects
                    }),
                    f"{second_field}__in": list({
                        getattr(obj, second_field) for obj in objects
                    }),
                    f"{third_field}__in": list({
                        getattr(obj, third_field) for obj in objects
                    }),
                }
            ).values_list(first_field, second_field, third_field)

            existing_keys = set(existing_rows)

            to_create = [
                obj for key, obj in objects_by_key.items()
                if key not in existing_keys
            ]

            skipped += len(objects) - len(to_create)

            try:
                model.objects.bulk_create(
                    to_create,
                    batch_size=BATCH_SIZE,
                )
            except Exception as exc:
                raise CommandError(
                    f"Lỗi import {label}, khoảng dòng "
                    f"{first_line}-{last_line}: {exc}"
                ) from exc

            created += len(to_create)

        processed += len(batch)
        if progress_bar:
            progress_bar.update(len(batch))
        else:
            stdout.write(f"\r{label}: Đã xử lý {processed:,}/{total_rows:,} dòng", ending="")
            stdout.flush()

    if progress_bar:
        progress_bar.close()
    else:
        stdout.write("")

    stdout.write(
        f"✔ {label}: tạo {created:,}, bỏ qua {skipped:,}"
    )


class Command(BaseCommand):
    help = "Import dữ liệu ESCO từ CSV; bỏ qua bản ghi đã tồn tại"

    def add_arguments(self, parser):
        parser.add_argument(
            "--data-dir",
            type=Path,
            default=(
                    Path(settings.BASE_DIR)
                    / "dataset"
                    / "ESCO dataset - v1.2.1 - classification - en - csv"
            ),
            help="Thư mục chứa các file CSV ESCO",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        data_dir = options["data_dir"].resolve()
        self.stdout.write(f"Đọc dữ liệu từ: {data_dir}\n")

        # 1. Skills (Có gán is_verified=True)
        import_entities(
            Skill,
            data_dir / "skills_en.csv",
            lambda row: (
                Skill(
                    id=clean(row.get("conceptUri")),
                    name=clean(row.get("preferredLabel")),
                    skill_type=clean(row.get("skillType")),
                    reuse_level=clean(row.get("reuseLevel")),
                    synonyms=combine_labels(
                        row.get("altLabels"),
                        row.get("hiddenLabels"),
                    ),
                    description=(
                            clean(row.get("description"))
                            or clean(row.get("definition"))
                    ),
                    is_verified=True,
                )
                if clean(row.get("conceptUri"))
                   and clean(row.get("preferredLabel"))
                else None
            ),
            "Skills",
            self.stdout,
        )

        # 2. Occupations (Có gán is_verified=True)
        import_entities(
            Occupation,
            data_dir / "occupations_en.csv",
            lambda row: (
                Occupation(
                    id=clean(row.get("conceptUri")),
                    code=clean(row.get("code")),
                    name=clean(row.get("preferredLabel")),
                    synonyms=combine_labels(
                        row.get("altLabels"),
                        row.get("hiddenLabels"),
                    ),
                    description=(
                            clean(row.get("description"))
                            or clean(row.get("definition"))
                    ),
                    is_verified=True,
                )
                if clean(row.get("conceptUri"))
                   and clean(row.get("preferredLabel"))
                else None
            ),
            "Occupations",
            self.stdout,
        )

        # 3. Occupation - Skill (Giữ nguyên không gán is_verified)
        import_relations(
            OccupationSkillRelation,
            data_dir / "occupationSkillRelations_en.csv",
            lambda row: (
                OccupationSkillRelation(
                    occupation_id=clean(row.get("occupationUri")),
                    skill_id=clean(row.get("skillUri")),
                    relation_type=clean(row.get("relationType")),
                )
                if clean(row.get("occupationUri"))
                   and clean(row.get("skillUri"))
                   and clean(row.get("relationType"))
                else None
            ),
            ("occupation_id", "skill_id", "relation_type"),
            "OccupationSkillRelation",
            self.stdout,
        )

        # 4. Skill - Skill (Giữ nguyên không gán is_verified)
        import_relations(
            SkillDependency,
            data_dir / "skillSkillRelations_en.csv",
            lambda row: (
                SkillDependency(
                    source_skill_id=clean(row.get("originalSkillUri")),
                    related_skill_id=clean(row.get("relatedSkillUri")),
                    relation_type=clean(row.get("relationType")),
                )
                if clean(row.get("originalSkillUri"))
                   and clean(row.get("relatedSkillUri"))
                   and clean(row.get("relationType"))
                else None
            ),
            ("source_skill_id", "related_skill_id", "relation_type"),
            "SkillDependency",
            self.stdout,
        )

        self.stdout.write(
            self.style.SUCCESS("\nImport dữ liệu ESCO hoàn tất thành công!")
        )