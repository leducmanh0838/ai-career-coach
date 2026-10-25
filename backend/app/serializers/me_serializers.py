# app/serializers/me_serializers.py
from rest_framework import serializers
from app.models import CustomUser, StudentProfile, Skill, StudentSkill


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
