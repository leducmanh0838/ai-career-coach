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

import json
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List
from app.models import InterviewQuestion, StudentSkill


# 1. Cấu trúc Pydantic nhận kết quả gộp cho nhiều câu hỏi
class SingleQuestionGrade(BaseModel):
    question_id: str = Field(description="Mã ID của câu hỏi trùng khớp với đầu vào")
    score: float = Field(description="Điểm số từ 0 đến 10 cho câu trả lời này")
    feedback: str = Field(description="Nhận xét chi tiết, chỉ ra điểm đúng và điểm cần cải thiện bằng tiếng Việt")


class BatchGradeResult(BaseModel):
    evaluations: List[SingleQuestionGrade] = Field(description="Danh sách kết quả chấm điểm cho từng câu hỏi")


class InterviewGradingService:

    @classmethod
    def evaluate_interview_submission(cls, student_profile, skill, level, answers_payload):
        """
        Chấm gộp toàn bộ bài test của một kỹ năng trong 1 lần gọi LLM duy nhất (Tiết kiệm token tối đa),
        tính trung bình cộng, và cập nhật StudentSkill nếu điểm >= 5.
        """
        questions_data = []
        question_map = {}

        # Thu thập thông tin câu hỏi từ DB
        for item in answers_payload:
            question_id = item.get("question_id")
            user_answer = item.get("user_answer")

            try:
                question_obj = InterviewQuestion.objects.get(id=question_id)
                question_map[question_id] = question_obj
                questions_data.append({
                    "question_id": question_id,
                    "question_text": question_obj.question_text,
                    "sample_answer": question_obj.sample_answer or "Không có đáp án mẫu cụ thể, dựa vào kiến thức chuyên ngành.",
                    "user_answer": user_answer
                })
            except InterviewQuestion.DoesNotExist:
                continue

        if not questions_data:
            return {"average_score": 0.0, "passed": False, "details": []}

        # Khởi tạo LLM và Parser
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)
        output_parser = PydanticOutputParser(pydantic_object=BatchGradeResult)

        prompt = ChatPromptTemplate.from_messages([
            ("system",
             "Bạn là một chuyên gia kỹ thuật và nhà tuyển dụng phần mềm giàu kinh nghiệm. "
             "Nhiệm vụ của bạn là đánh giá toàn bộ danh sách câu trả lời phỏng vấn của ứng viên cho kỹ năng '{skill_name}' (Cấp độ: {level}) "
             "dựa trên câu hỏi và đáp án mẫu của từng câu.\n"
             "Thang điểm cho mỗi câu từ 0 đến 10:\n"
             "- Dưới 5 điểm: Chưa đạt (trả lời sai, thiếu ý cốt lõi hoặc hời hợt).\n"
             "- Từ 5 điểm trở lên: Đạt (hiểu vấn đề, trả lời đúng các ý chính).\n"
             "Hãy trả về kết quả định dạng JSON khớp chính xác với cấu trúc yêu cầu.\n"
             "{format_instructions}"
             ),
            ("human",
             "Dưới đây là danh sách các câu hỏi và câu trả lời của ứng viên:\n{questions_json}"
             )
        ])

        chain = prompt | llm | output_parser

        try:
            # Gọi LLM 1 lần duy nhất cho toàn bộ bài test của kỹ năng này
            result = chain.invoke({
                "skill_name": skill.name,
                "level": level,
                "questions_json": json.dumps(questions_data, ensure_ascii=False, indent=2),
                "format_instructions": output_parser.get_format_instructions()
            })

            total_score = 0.0
            graded_details = []

            for ev in result.evaluations:
                q_obj = question_map.get(ev.question_id)
                user_ans = next(
                    (item["user_answer"] for item in questions_data if item["question_id"] == ev.question_id), "")

                total_score += ev.score
                graded_details.append({
                    "question_id": ev.question_id,
                    "question_text": q_obj.question_text if q_obj else "",
                    "user_answer": user_ans,
                    "score": ev.score,
                    "feedback": ev.feedback
                })

            num_questions = len(graded_details)
            if num_questions == 0:
                return {"average_score": 0.0, "passed": False, "details": []}

            average_score = total_score / num_questions
            passed = average_score >= 5.0

            # Nếu đạt (>= 5), cập nhật hoặc tạo mới StudentSkill cho sinh viên
            if passed:
                StudentSkill.objects.update_or_create(
                    student_profile=student_profile,
                    skill=skill,
                    defaults={
                        "level": level,
                        "reasoning": f"Đã vượt qua bài kiểm tra phỏng vấn năng lực với điểm trung bình {average_score:.1f}/10.",
                    }
                )

            return {
                "average_score": round(average_score, 2),
                "passed": passed,
                "details": graded_details
            }

        except Exception as e:
            print(f"Lỗi khi gọi LangChain chấm điểm batch: {e}")
            return {"average_score": 0.0, "passed": False, "details": [], "error": str(e)}