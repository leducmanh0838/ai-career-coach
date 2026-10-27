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
