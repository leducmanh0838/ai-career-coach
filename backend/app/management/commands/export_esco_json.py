
import json
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from app.models import (
    Skill,
    Occupation,
    OccupationSkillRelation,
    SkillDependency,
)


def to_json_value(value):
    """Chuyển giá trị của model thành kiểu JSON có thể lưu được."""
    if value is None or isinstance(value, (str, int, float, bool)):
        return value

    # Hỗ trợ vector embedding hoặc các kiểu dữ liệu có .tolist().
    if hasattr(value, "tolist"):
        return to_json_value(value.tolist())

    if isinstance(value, (list, tuple)):
        return [to_json_value(item) for item in value]

    if isinstance(value, dict):
        return {
            str(key): to_json_value(item)
            for key, item in value.items()
        }

    # Hỗ trợ datetime, date và các kiểu có isoformat().
    if hasattr(value, "isoformat"):
        return value.isoformat()

    raise TypeError(
        f"Không thể chuyển {type(value).__name__} sang JSON."
    )


class Command(BaseCommand):
    help = "Export toàn bộ dữ liệu ESCO thành một file JSON"

    def add_arguments(self, parser):
        parser.add_argument(
            "--output",
            type=Path,
            default=(
                Path(settings.BASE_DIR)
                / "data"
                / "data.json"
            ),
            help="Đường dẫn file JSON đầu ra",
        )

    def handle(self, *args, **options):
        output_path = options["output"].resolve()

        models = [
            ("skills", Skill),
            ("occupations", Occupation),
            ("occupation_skill_relations", OccupationSkillRelation),
            ("skill_dependencies", SkillDependency),
        ]

        data = {
            "format_version": 1,
            "models": {},
        }

        try:
            for label, model in models:
                total = model.objects.count()
                records = []

                self.stdout.write(
                    f"Đang export {label}: {total:,} bản ghi..."
                )

                for obj in model.objects.iterator(chunk_size=1000):
                    record = {}

                    # Lưu tất cả các field thực của model,
                    # bao gồm PK, FK, timestamp và embedding.
                    for field in model._meta.concrete_fields:
                        record[field.attname] = to_json_value(
                            getattr(obj, field.attname)
                        )

                    records.append(record)

                data["models"][label] = records

                self.stdout.write(
                    f"Đã export {label}: {len(records):,} bản ghi."
                )

            output_path.parent.mkdir(
                parents=True,
                exist_ok=True,
            )

            with output_path.open(
                "w",
                encoding="utf-8",
                newline="\n",
            ) as file:
                json.dump(
                    data,
                    file,
                    ensure_ascii=False,
                    indent=2,
                    allow_nan=False,
                )

        except (OSError, TypeError, ValueError) as exc:
            raise CommandError(
                f"Không thể export JSON: {exc}"
            ) from exc

        self.stdout.write(
            self.style.SUCCESS(
                f"Export hoàn tất: {output_path}"
            )
        )
