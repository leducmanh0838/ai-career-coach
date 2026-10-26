from app.models import JobRequiredSkill, Skill, JobPosting


def save_jd_analysis_result(job_posting: JobPosting, final_result: dict):
    """Lưu kết quả phân tích JD (kỹ năng yêu cầu) vào cơ sở dữ liệu."""
    JobRequiredSkill.objects.filter(job=job_posting).delete()

    skills_data = final_result.get("skills", []) or final_result.get("required_skills", [])

    for item in skills_data:
        skill_id = item.get("skill_id") or item.get("id")
        skill_obj = None

        if skill_id:
            skill_obj = Skill.objects.filter(pk=skill_id).first()
        else:
            skill_name = item.get("skill_name") or item.get("name")
            if skill_name:
                skill_obj = Skill.objects.filter(name__iexact=skill_name).first()

        JobRequiredSkill.objects.create(
            job=job_posting,
            skill=skill_obj,
            level=item.get("level"),
            reasoning=item.get("reasoning", ""),
            evidence=item.get("evidence", [])
        )
