from django.core.management.base import BaseCommand
from app.models import Skill, Occupation


class Command(BaseCommand):
    help = "Preview 10 Skill và 10 Occupation đầu tiên"

    def handle(self, *args, **options):
        self.preview_skills()
        self.preview_occupations()

    def preview_skills(self):
        self.stdout.write("\n=== SKILLS: 10 bản ghi đầu ===\n")

        skills = Skill.objects.order_by("id")[:10]

        rows = []
        for skill in skills:
            rows.append([
                str(skill.id)[:20],
                skill.name or "",
                skill.name_vi or "",
                "Có" if skill.embedding is not None else "Chưa",
            ])

        self.print_table(
            headers=["ID", "Name (EN)", "Name (VI)", "Embedding"],
            rows=rows,
        )

    def preview_occupations(self):
        self.stdout.write("\n=== OCCUPATIONS: 10 bản ghi đầu ===\n")

        occupations = Occupation.objects.order_by("id")[:10]

        rows = []
        for occupation in occupations:
            rows.append([
                str(occupation.id)[:20],
                occupation.name or "",
                occupation.name_vi or "",
                "Có" if occupation.embedding is not None else "Chưa",
            ])

        self.print_table(
            headers=["ID", "Name (EN)", "Name (VI)", "Embedding"],
            rows=rows,
        )

    def print_table(self, headers, rows):
        if not rows:
            self.stdout.write("Không có dữ liệu.")
            return

        # Tính độ rộng cột dựa trên nội dung
        widths = [
            max(len(str(header)), *(len(str(row[i])) for row in rows))
            for i, header in enumerate(headers)
        ]

        separator = "+-" + "-+-".join("-" * width for width in widths) + "-+"

        def format_row(row):
            return "| " + " | ".join(
                str(value).ljust(width)
                for value, width in zip(row, widths)
            ) + " |"

        self.stdout.write(separator)
        self.stdout.write(format_row(headers))
        self.stdout.write(separator)

        for row in rows:
            self.stdout.write(format_row(row))

        self.stdout.write(separator)
        self.stdout.write(f"Tổng số bản ghi hiển thị: {len(rows)}")