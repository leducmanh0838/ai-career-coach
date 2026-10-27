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

# app/serializers/me_serializers.py
from rest_framework import serializers
from app.models import CustomUser, StudentProfile, Skill, StudentSkill
from app.serializers.job_posting_serializers import JobPostingSerializer


class StudentProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ["profile_summary", "extracted_occupations"]


class SkillDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "name_vi", "skill_type", "description_vi"]


class StudentSkillSerializer(serializers.ModelSerializer):
    skill = SkillDetailSerializer(read_only=True)

    class Meta:
        model = StudentSkill
        fields = ["id", "skill", "level", "reasoning", "evidence"]


class StudentProfileSerializer(serializers.ModelSerializer):
    """Serializer cơ bản cho StudentProfile (dùng cho /me/)"""

    class Meta:
        model = StudentProfile
        fields = ["id", "profile_summary", "extracted_occupations", "updated_at"]


class StudentProfileDetailSerializer(StudentProfileSerializer):
    """Serializer chi tiết cho StudentProfile, bao gồm cả danh sách kỹ năng bên trong"""
    student_skills = StudentSkillSerializer(many=True, read_only=True)

    class Meta(StudentProfileSerializer.Meta):
        fields = StudentProfileSerializer.Meta.fields + ["student_skills"]


class UserMeBaseSerializer(serializers.ModelSerializer):
    """Serializer cơ bản cho /me/ (Chỉ user + student_profile cơ bản)"""
    student_profile = StudentProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "phone_number",
            "avatar_url",
            "student_profile",
        ]


class UserMeDetailSerializer(serializers.ModelSerializer):
    """Serializer đầy đủ cho /me/detail/ (student_profile chứa danh sách kỹ năng)"""
    student_profile = StudentProfileDetailSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "phone_number",
            "avatar_url",
            "student_profile",
        ]


class UserRecruiterDetailSerializer(serializers.ModelSerializer):
    job_postings = JobPostingSerializer(many=True, read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "phone_number",
            "avatar_url",
            "job_postings",
        ]
