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

from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from django.db.models import Q

from ..models import Occupation
from .translate import translate_texts

TRANSLATION_FIELDS = {
    "name": "name_vi",
    "synonyms": "synonyms_vi",
    "description": "description_vi",
}


def ensure_occupation_translated(occupation: Occupation) -> Occupation:
    if occupation.pk is None:
        raise ValueError("Occupation must be saved before translation.")

    fields = [*TRANSLATION_FIELDS.keys(), *TRANSLATION_FIELDS.values()]
    data = Occupation.objects.filter(pk=occupation.pk).values(*fields).first()

    if data is None:
        raise ValueError("Occupation not found.")

    missing = [
        (source, target, data[source])
        for source, target in TRANSLATION_FIELDS.items()
        if (data[source] or "").strip()
           and not (data[target] or "").strip()
    ]

    if not missing:
        for target in TRANSLATION_FIELDS.values():
            setattr(occupation, target, data[target])
        return occupation

    translations = translate_texts([item[2] for item in missing])

    if len(translations) != len(missing):
        raise ValueError("Translation count does not match input.")

    for (_, target, _), translation in zip(missing, translations):
        translation = translation.strip()
        if not translation:
            continue

        Occupation.objects.filter(pk=occupation.pk).filter(
            Q(**{target: ""}) | Q(**{f"{target}__isnull": True})
        ).update(**{target: translation})

    data = Occupation.objects.filter(pk=occupation.pk).values(*fields).first()

    if data is None:
        raise ValueError("Occupation not found.")

    for target in TRANSLATION_FIELDS.values():
        setattr(occupation, target, data[target])

    return occupation


def search_occupations_fts(query_text: str, limit: int = 10):
    """
    Tìm kiếm Full-Text Search chỉ dựa trên name và synonyms (EN) của Occupation
    tận dụng GIN index 'occ_fulltext_idx' với config='simple'.
    """
    if not query_text or not query_text.strip():
        return Occupation.objects.none()

    query_text = query_text.strip()

    vector = SearchVector("name", "synonyms", config="simple")
    query = SearchQuery(query_text, config="simple")

    queryset = (
        Occupation.objects.annotate(
            search=vector,
            rank=SearchRank(vector, query)
        )
        .filter(search=query)  # Kích hoạt sử dụng GIN index 'occ_fulltext_idx'
        .order_by("-rank")[:limit]  # Sắp xếp theo thứ tự độ khớp giảm dần
    )

    return queryset
