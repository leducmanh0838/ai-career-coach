from django.db import transaction
from app.models import StudentProfile, Skill, StudentSkill


@transaction.atomic
def save_student_analysis_result(user, analysis_data: dict):
    profile, _ = StudentProfile.objects.update_or_create(
        user=user,
        defaults={
            "profile_summary": analysis_data.get("profile_summary"),
            "extracted_occupations": analysis_data.get("extracted_occupations", []),
        }
    )

    StudentSkill.objects.filter(student_profile=profile).delete()

    skill_objects_to_create = []
    for item in analysis_data.get("skills", []):
        skill_id = item.get("skill_id")

        skill_instance = Skill.objects.filter(id=skill_id).first() if skill_id else None

        skill_objects_to_create.append(
            StudentSkill(
                student_profile=profile,
                skill=skill_instance,
                level=item.get("level"),
                reasoning=item.get("reasoning"),
                evidence=item.get("evidence", [])
            )
        )

    StudentSkill.objects.bulk_create(skill_objects_to_create)
    return profile