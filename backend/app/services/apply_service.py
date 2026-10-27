from django.db import transaction

from app.models import JobApplication, PersonalizedRoadmap, JobRequiredSkill, StudentSkill, SkillLevel, SkillDependency


class CareerCoachService:

    @staticmethod
    @transaction.atomic
    def apply_job_and_generate_roadmap(student_profile, job_posting):
        """
        1. Tạo đơn ứng tuyển (JobApplication).
        2. Thu thập kỹ năng yêu cầu từ Job (JobRequiredSkill).
        3. Kiểm tra quan hệ phụ thuộc (SkillDependency - ESSENTIAL) để bổ sung các kỹ năng bắt buộc đi kèm.
        4. So sánh kỹ năng của sinh viên (StudentSkill):
           - Nếu sinh viên không có skill (null) -> Coi như level 0.
           - Nếu thiếu hoặc level thấp hơn yêu cầu -> Đưa vào PersonalizedRoadmap.
        """
        # Tạo hoặc lấy đơn ứng tuyển
        application, created = JobApplication.objects.get_or_create(
            student_profile=student_profile,
            job_posting=job_posting
        )

        # Xóa lộ trình cũ nếu apply lại
        PersonalizedRoadmap.objects.filter(application=application).delete()

        # Lấy danh sách kỹ năng yêu cầu của job
        job_required_skills = JobRequiredSkill.objects.filter(job=job_posting)

        # Lấy từ điển kỹ năng hiện tại của sinh viên: {skill_id: level}
        student_skills_map = {
            ss.skill_id: ss.level for ss in StudentSkill.objects.filter(student_profile=student_profile)
        }

        # Bảng quy đổi cấp độ sang thang điểm số để so sánh (null = 0)
        level_hierarchy = {
            None: 0,
            SkillLevel.FOUNDATION: 1,
            SkillLevel.APPLIED: 2,
            SkillLevel.PROFICIENT: 3,
            SkillLevel.ADVANCED: 4,
        }

        # Hàm phụ trợ để gộp và lấy level cao nhất nếu một kỹ năng xuất hiện nhiều lần (từ Job hoặc qua Dependency)
        target_skills = {}

        def update_target(skill, level):
            if not skill:
                return
            current_level = target_skills.get(skill)
            if not current_level:
                target_skills[skill] = level
            else:
                # Lấy mức độ yêu cầu cao hơn nếu bị trùng
                if level_hierarchy.get(level, 0) > level_hierarchy.get(current_level, 0):
                    target_skills[skill] = level

        # 1. Duyệt qua các kỹ năng yêu cầu trực tiếp từ Job
        for req in job_required_skills:
            if not req.skill:
                continue

            req_level = req.level or SkillLevel.FOUNDATION
            update_target(req.skill, req_level)

            # 2. Kiểm tra các kỹ năng phụ thuộc bắt buộc (ESSENTIAL) của kỹ năng này
            essential_dependencies = SkillDependency.objects.filter(
                source_skill=req.skill,
                relation_type=SkillDependency.SkillRelationType.ESSENTIAL
            ).select_related('related_skill')

            for dep in essential_dependencies:
                if dep.related_skill:
                    # Kỹ năng phụ thuộc bắt buộc cũng mang mức yêu cầu tương đương (hoặc bạn có thể tùy chỉnh)
                    update_target(dep.related_skill, req_level)

        # 3. So sánh danh sách kỹ năng tổng hợp với kỹ năng của sinh viên
        roadmap_items = []
        for skill, target_lvl in target_skills.items():
            student_level = student_skills_map.get(skill.id)  # Trả về None nếu sinh viên không có

            student_score = level_hierarchy.get(student_level, 0)
            req_score = level_hierarchy.get(target_lvl, 1)

            # Nếu điểm của sinh viên thấp hơn yêu cầu -> Thêm vào lộ trình học
            if student_score < req_score:
                roadmap_items.append(
                    PersonalizedRoadmap(
                        application=application,
                        skill=skill,
                        target_level=target_lvl
                    )
                )

        # Bulk create danh sách lộ trình cần học bổ sung
        if roadmap_items:
            PersonalizedRoadmap.objects.bulk_create(roadmap_items)

        return application
