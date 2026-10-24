# app/services/analyze_skill_service/pipeline.py
import json
import time
from typing import Literal, Union
from langchain_core.prompts import ChatPromptTemplate
from app.models import Skill
from app.services.analyze_skill_service.ai_config import (
    CRITICAL_MODEL,
    EXTRACT_CV_FACTS_SYSTEM_PROMPT,
    EXTRACT_JD_FACTS_SYSTEM_PROMPT,
    MATCH_CV_SKILLS_SYSTEM_PROMPT,
    MATCH_JD_SKILLS_SYSTEM_PROMPT,
)
from app.services.analyze_skill_service.schemas import (
    CVFacts,
    JDFacts,
    ExtractedSkill,
    SkillMatchResult,
    SkillMatchDecision,
    GeneratedSkillInfo,
)
from app.services.analyze_skill_service.utils import is_evidence_in_doc

def extract_document_facts(llm, doc_text: str, doc_type: Literal["cv", "jd"] = "cv") -> tuple[Union[CVFacts, JDFacts], dict]:
    start_time = time.time()

    if doc_type == "cv":
        system_prompt = EXTRACT_CV_FACTS_SYSTEM_PROMPT
        output_schema = CVFacts
        doc_label = "CV ứng viên"
    else:
        system_prompt = EXTRACT_JD_FACTS_SYSTEM_PROMPT or "Bạn là chuyên gia trích xuất thông tin tuyển dụng."
        output_schema = JDFacts
        doc_label = "Mô tả công việc (JD)"

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "Trích xuất tài liệu {doc_label} sau theo đúng schema yêu cầu:\n\n<document>\n{doc_text}\n</document>"),
    ])

    chain = prompt | llm.with_structured_output(output_schema, include_raw=True)
    raw_response = chain.invoke({"doc_text": doc_text, "doc_label": doc_label})

    result = raw_response["parsed"]
    token_usage = {}
    if hasattr(raw_response["raw"], "response_metadata") and "token_usage" in raw_response["raw"].response_metadata:
        token_usage = raw_response["raw"].response_metadata["token_usage"]

    valid_skills = []
    seen = set()
    for skill in result.skills:
        skill.name = skill.name.strip()
        if not skill.name:
            continue
        key = skill.name.casefold()
        if key in seen:
            continue

        verified_ev = [ev.strip() for ev in skill.evidence if is_evidence_in_doc(ev, doc_text)]
        if verified_ev:
            skill.evidence = verified_ev
            seen.add(key)
            valid_skills.append(skill)

    result.skills = valid_skills
    elapsed = time.time() - start_time
    print(f"   ⏱️ [Trích xuất {doc_label.upper()} ({CRITICAL_MODEL})] Hoàn thành trong {elapsed:.2f}s | Token: {token_usage}")
    return result, token_usage

def match_skills_with_ai(
        llm,
        extracted_skills: list[ExtractedSkill],
        candidates_by_mention: list[list[dict]],
        doc_type: Literal["cv", "jd"] = "cv",
) -> tuple[SkillMatchResult, dict]:
    start_time = time.time()
    total_tokens = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}

    if not extracted_skills:
        return SkillMatchResult(decisions=[]), total_tokens

    mentions_payload = []
    allowed_ids_by_index = []

    for index, (skill, candidates) in enumerate(zip(extracted_skills, candidates_by_mention)):
        compact_cands = []
        seen = set()

        for c in candidates:
            candidate_id = c["id"]
            if candidate_id in seen:
                continue
            seen.add(candidate_id)
            compact_cands.append({"id": candidate_id, "name": c["name"]})

        allowed_ids_by_index.append({c["id"] for c in compact_cands})
        mentions_payload.append({
            "mention_index": index,
            "skill_name": skill.name,
            "evidence": skill.evidence,
            "candidates": compact_cands,
        })

    system_prompt = MATCH_CV_SKILLS_SYSTEM_PROMPT if doc_type == "cv" else MATCH_JD_SKILLS_SYSTEM_PROMPT

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", f"Thực hiện phân tích đối chiếu kỹ năng cho loại tài liệu ({doc_type}):\n\n{{payload}}"),
    ])

    chain = prompt | llm.with_structured_output(SkillMatchResult, include_raw=True)
    payload_json = json.dumps(mentions_payload, ensure_ascii=False, separators=(",", ":"))

    print(f"   [API Call - {CRITICAL_MODEL}] Gửi {len(mentions_payload)} kỹ năng từ ({doc_type}) để xác minh...")
    raw_resp = chain.invoke({"payload": payload_json})
    ai_result = raw_resp["parsed"]

    if hasattr(raw_resp["raw"], "response_metadata") and "token_usage" in raw_resp["raw"].response_metadata:
        total_tokens = raw_resp["raw"].response_metadata["token_usage"]

    decisions_map = {d.mention_index: d for d in (ai_result.decisions or []) if isinstance(d.mention_index, int)}

    validated = []
    for idx, skill in enumerate(extracted_skills):
        dec = decisions_map.get(idx)
        allowed = allowed_ids_by_index[idx]

        if not dec or not dec.matched_skill_id or str(dec.matched_skill_id) not in allowed:
            validated.append(SkillMatchDecision(
                mention_index=idx, matched_skill_id=None, level=None, confidence=0.0,
                reasoning="Không tìm thấy bản đồ kỹ năng tương đương chính xác trong hệ thống."
            ))
        else:
            validated.append(SkillMatchDecision(
                mention_index=idx, matched_skill_id=str(dec.matched_skill_id),
                level=dec.level, confidence=max(0.0, min(1.0, float(dec.confidence or 0.8))),
                reasoning=dec.reasoning
            ))

    elapsed = time.time() - start_time
    print(f"   ⏱️ [Xác minh Skill ({doc_type})] Hoàn thành trong {elapsed:.2f}s | Token: {total_tokens}")
    return SkillMatchResult(decisions=validated), total_tokens

def auto_expand_unmatched_skills(llm, embeddings, extracted_skills: list[ExtractedSkill], skill_decisions: SkillMatchResult):
    print("\n[Dynamic Expansion] Kiểm tra và tự động bổ sung kỹ năng mới vào hệ thống...")

    for decision in skill_decisions.decisions:
        if decision.matched_skill_id is None:
            extracted = extracted_skills[decision.mention_index]
            skill_name = extracted.name

            prompt = ChatPromptTemplate.from_messages([
                ("system", "Bạn là chuyên gia kho dữ liệu kỹ năng công nghệ. Hãy tạo thông tin chuẩn hóa bằng cả tiếng Anh và tiếng Việt."),
                ("human", f"Tên kỹ năng gốc: {skill_name}")
            ])
            chain = prompt | llm.with_structured_output(GeneratedSkillInfo)
            try:
                info = chain.invoke({})
                vec = embeddings.embed_query(info.name)

                new_skill = Skill.objects.create(
                    name=info.name,
                    synonyms=info.synonyms,
                    name_vi=info.name_vi,
                    synonyms_vi=info.synonyms_vi,
                    description_vi=info.description_vi,
                    is_verified=False,
                    embedding=vec
                )

                decision.matched_skill_id = str(new_skill.id)
                decision.level = None
                decision.confidence = 0.5
                decision.reasoning = "Tự động bổ sung skill mới vào hệ thống."
                print(f"   ✨ Đã tạo mới & map skill: '{skill_name}' -> ID: {new_skill.id}")
            except Exception as e:
                print(f"   ⚠️ Lỗi tạo skill mới cho '{skill_name}': {e}")

def build_final_result(facts: Union[CVFacts, JDFacts], skill_decisions: SkillMatchResult, doc_type: Literal["cv", "jd"] = "cv") -> dict:
    skill_ids = [d.matched_skill_id for d in skill_decisions.decisions if d.matched_skill_id]
    skills_map = {str(s.id): s for s in Skill.objects.filter(id__in=skill_ids)}

    output_skills = []
    for dec in skill_decisions.decisions:
        idx = dec.mention_index
        if not (0 <= idx < len(facts.skills)):
            continue
        extracted = facts.skills[idx]
        matched = skills_map.get(dec.matched_skill_id) if dec.matched_skill_id else None

        output_skills.append({
            "source_name": extracted.name,
            "skill_id": str(matched.id) if matched else None,
            "skill_name": matched.name if matched else None,
            "level": dec.level,
            "evidence": extracted.evidence,
            "confidence": dec.confidence,
            "reasoning": dec.reasoning,
            "status": "matched" if matched else "unmatched",
        })

    base_result = {
        "extracted_occupations": facts.extracted_occupations,
        "skills": output_skills,
        "statistics": {
            "extracted_skills": len(facts.skills),
            "matched_skills": sum(1 for s in output_skills if s["status"] == "matched"),
            "unmatched_skills": sum(1 for s in output_skills if s["status"] == "unmatched"),
        },
    }

    if doc_type == "cv":
        base_result["candidate_name"] = getattr(facts, "candidate_name", None)
        base_result["profile_summary"] = getattr(facts, "profile_summary", None)
    else:
        base_result["job_title"] = getattr(facts, "job_title", None)
        base_result["company_name"] = getattr(facts, "company_name", None)
        base_result["job_summary"] = getattr(facts, "job_summary", None)

    return base_result