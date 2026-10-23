from concurrent.futures import ThreadPoolExecutor, as_completed
from time import monotonic

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from langchain_openai import OpenAIEmbeddings
from tqdm import tqdm

from app.models import Occupation


def build_embedding_text(occupation: Occupation) -> str:
    """Tạo văn bản embedding chỉ từ tên nghề nghiệp."""
    return (occupation.name or "").strip() or str(occupation.id)


def embed_batch(
    embeddings: OpenAIEmbeddings,
    texts: list[str],
) -> list[list[float]]:
    """Chỉ gọi API; không truy vấn hoặc ghi database trong worker."""
    return embeddings.embed_documents(texts)


class Command(BaseCommand):
    help = "Generate OpenAI embeddings for Occupation records in parallel batches."

    def add_arguments(self, parser):
        parser.add_argument(
            "--batch-size",
            type=int,
            default=100,
            help="Số nghề nghiệp trong mỗi request (default: 100).",
        )
        parser.add_argument(
            "--workers",
            type=int,
            default=4,
            help="Số request chạy đồng thời (default: 4).",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=None,
            help="Giới hạn số bản ghi để chạy thử.",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Tạo lại embedding cho cả bản ghi đã có vector.",
        )

    def handle(self, *args, **options):
        batch_size = options["batch_size"]
        workers = options["workers"]
        limit = options["limit"]
        force = options["force"]

        if batch_size < 1 or workers < 1:
            raise CommandError("--batch-size và --workers phải >= 1.")

        if limit is not None and limit < 1:
            raise CommandError("--limit phải >= 1.")

        queryset = Occupation.objects.all().order_by("id")

        # Mặc định chỉ xử lý bản ghi chưa có embedding.
        if not force:
            queryset = queryset.filter(embedding__isnull=True)

        if limit is not None:
            queryset = queryset[:limit]

        occupations = list(queryset)

        if not occupations:
            self.stdout.write(
                self.style.SUCCESS(
                    "Không có nghề nghiệp nào cần tạo embedding."
                )
            )
            return

        batches = [
            occupations[i : i + batch_size]
            for i in range(0, len(occupations), batch_size)
        ]

        texts_by_batch = [
            [build_embedding_text(occupation) for occupation in batch]
            for batch in batches
        ]

        embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            dimensions=1536,
            max_retries=5,
            request_timeout=60,
        )

        self.stdout.write(
            f"Tổng bản ghi: {len(occupations):,} | "
            f"Batch: {len(batches):,} | "
            f"Workers: {workers} | "
            f"Batch size: {batch_size}"
        )

        started_at = monotonic()
        succeeded = 0
        failed = 0
        errors = []

        with tqdm(
            total=len(occupations),
            desc="Generating occupation embeddings",
            unit="occupation",
            dynamic_ncols=True,
        ) as progress:
            with ThreadPoolExecutor(max_workers=workers) as executor:
                future_to_index = {
                    executor.submit(
                        embed_batch, embeddings, texts
                    ): index
                    for index, texts in enumerate(texts_by_batch)
                }

                for future in as_completed(future_to_index):
                    batch_index = future_to_index[future]
                    batch = batches[batch_index]

                    try:
                        vectors = future.result()

                        if len(vectors) != len(batch):
                            raise ValueError(
                                "Số vector trả về không khớp "
                                "số đầu vào."
                            )

                        for occupation, vector in zip(batch, vectors):
                            if len(vector) != 1536:
                                raise ValueError(
                                    f"Vector của Occupation "
                                    f"{occupation.id} có "
                                    f"{len(vector)} chiều."
                                )

                            occupation.embedding = vector

                        # Ghi database sau khi toàn bộ batch hợp lệ.
                        with transaction.atomic():
                            Occupation.objects.bulk_update(
                                batch,
                                ["embedding"],
                                batch_size=batch_size,
                            )

                        succeeded += len(batch)

                    except Exception as exc:
                        failed += len(batch)
                        errors.append(
                            f"Batch {batch_index + 1}: "
                            f"{type(exc).__name__}: {exc}"
                        )

                    progress.update(len(batch))

                    elapsed = monotonic() - started_at
                    rate = succeeded / elapsed if elapsed else 0

                    progress.set_postfix(
                        ok=succeeded,
                        failed=failed,
                        occupations_per_sec=f"{rate:.1f}",
                    )

        elapsed = monotonic() - started_at

        self.stdout.write("")
        self.stdout.write(f"Thời gian: {elapsed:.1f} giây")
        self.stdout.write(f"Thành công: {succeeded:,}")
        self.stdout.write(f"Thất bại: {failed:,}")

        if succeeded:
            self.stdout.write(
                f"Tốc độ thành công: "
                f"{succeeded / elapsed:.2f} occupation/s"
            )

        if errors:
            self.stderr.write(
                self.style.ERROR("\nCác batch bị lỗi:")
            )
            for error in errors:
                self.stderr.write(f"- {error}")

            raise CommandError(
                f"Có {failed} bản ghi chưa xử lý thành công. "
                "Hãy chạy lại command để xử lý các bản ghi còn thiếu."
            )

        self.stdout.write(
            self.style.SUCCESS(
                "Đã tạo embedding nghề nghiệp thành công."
            )
        )