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

# app/services/analyze_skill_service/retrieval.py
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from django.db.models import Q
from pgvector.django import CosineDistance
from app.models import Skill, Occupation, OccupationSkillRelation
from app.services.analyze_skill_service.schemas import ExtractedSkill

def search_skills_fts(query_text: str, limit: int = 5):
    if not query_text or not query_text.strip():
        return Skill.objects.none()
    query_text = query_text.strip()
    vector = SearchVector("name", "synonyms", config="simple")
    query = SearchQuery(query_text, config="simple")
    return (
        Skill.objects.annotate(search=vector, rank=SearchRank(vector, query))
        .filter(search=query)
        .order_by("-rank")[:limit]
    )

def search_occupations_fts(query_text: str, limit: int = 5):
    if not query_text or not query_text.strip():
        return Occupation.objects.none()
    query_text = query_text.strip()
    vector = SearchVector("name", "synonyms", config="simple")
    query = SearchQuery(query_text, config="simple")
    return (
        Occupation.objects.annotate(search=vector, rank=SearchRank(vector, query))
        .filter(search=query)
        .order_by("-rank")[:limit]
    )

def retrieve_skills_from_occupations(extracted_occupations: list[str]) -> list[Skill]:
    if not extracted_occupations:
        return []

    matched_occ_ids = set()
    for occ_name in extracted_occupations:
        occs = search_occupations_fts(occ_name, limit=2)
        for occ in occs:
            matched_occ_ids.add(occ.id)

    if not matched_occ_ids:
        return []

    relations = OccupationSkillRelation.objects.filter(occupation_id__in=matched_occ_ids).select_related("skill")[:50]
    skills = [rel.skill for rel in relations if rel.skill]
    return list({s.id: s for s in skills}.values())

def retrieve_skill_candidates(
        skill_mention: ExtractedSkill,
        query_embedding: list[float],
        occupation_derived_skills: list[Skill],
        top_k: int = 5,
) -> list[dict]:
    query = skill_mention.name.strip()
    if not query:
        return []

    candidates: dict[str, dict] = {}

    def add_candidate(skill):
        key = str(skill.id)
        if key not in candidates:
            candidates[key] = {
                "id": str(skill.id),
                "name": skill.name,
                "synonyms": skill.synonyms or "",
            }

    for skill in Skill.objects.filter(Q(name__iexact=query) | Q(name_vi__iexact=query))[:3]:
        add_candidate(skill)

    for skill in search_skills_fts(query, limit=top_k):
        add_candidate(skill)

    query_fold = query.casefold()
    for skill in occupation_derived_skills:
        if query_fold in skill.name.casefold() or skill.name.casefold() in query_fold:
            add_candidate(skill)

    vector_rows = (
        Skill.objects.filter(embedding__isnull=False)
        .annotate(distance=CosineDistance("embedding", query_embedding))
        .order_by("distance")[:top_k]
    )
    for skill in vector_rows:
        add_candidate(skill)

    return list(candidates.values())[:8]