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

# app/services/analyze_skill_service/schemas.py
from typing import Literal, Optional
from pydantic import BaseModel, Field


class ExtractedSkill(BaseModel):
    name: str = Field(description="Tên kỹ năng/công nghệ chuẩn hóa tiếng Anh.")
    evidence: list[str] = Field(description="Danh sách các đoạn trích ngắn nguyên văn.")


class CVFacts(BaseModel):
    candidate_name: Optional[str] = None
    profile_summary: str = Field(description="Tóm tắt ngắn gọn năng lực chuyên môn.")
    extracted_occupations: list[str] = Field(default=[], description="Danh sách chức danh hướng tới.")
    skills: list[ExtractedSkill]


class JDFacts(BaseModel):
    job_title: Optional[str] = Field(description="Chức danh tuyển dụng.")
    company_name: Optional[str] = Field(default=None, description="Tên công ty tuyển dụng.")
    job_summary: str = Field(description="Tóm tắt ngắn gọn yêu cầu công việc.")
    extracted_occupations: list[str] = Field(default=[], description="Danh sách chức danh tương ứng.")
    skills: list[ExtractedSkill]


class SkillMatchDecision(BaseModel):
    mention_index: int = Field(description="Index của kỹ năng trong danh sách.")
    matched_skill_id: Optional[str] = Field(description="ID Skill trong hệ thống.")
    level: Optional[Literal["Foundation", "Applied", "Proficient", "Advanced"]] = Field(default=None)
    confidence: float = Field(ge=0, le=1)
    reasoning: str = Field(description="Giải thích ngắn gọn.")


class SkillMatchResult(BaseModel):
    decisions: list[SkillMatchDecision]


class GeneratedSkillInfo(BaseModel):
    name: str = Field(description="Tên chuẩn hóa tiếng Anh chính thức.")
    synonyms: str = Field(description="Tên gọi khác bằng tiếng Anh.")
    name_vi: str = Field(description="Tên tiếng Việt tương đương.")
    synonyms_vi: str = Field(description="Tên gọi khác bằng tiếng Việt.")
    description_vi: str = Field(description="Mô tả chi tiết bằng tiếng Việt.")
