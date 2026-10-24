# app/serializers/me_serializers.py
from rest_framework import serializers
from app.models import CustomUser, StudentProfile, Skill, StudentSkill


class SkillDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "name_vi", "skill_type", "description_vi"]


class StudentSkillSerializer(serializers.ModelSerializer):
    skill = SkillDetailSerializer(read_only=True)

    class Meta:
        model = StudentSkill
        fields = ["id", "skill", "level", "reasoning", "evidence", "status"]


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ["profile_summary", "extracted_occupations", "updated_at"]


class UserMeBaseSerializer(serializers.ModelSerializer):
    """Serializer cơ bản cho /me/ (Chỉ user + student_profile, tối ưu join)"""
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


class UserMeDetailSerializer(UserMeBaseSerializer):
    """Serializer đầy đủ cho /me/detail/ (Bao gồm cả danh sách kỹ năng)"""
    student_skills = serializers.SerializerMethodField(read_only=True)

    class Meta(UserMeBaseSerializer.Meta):
        fields = UserMeBaseSerializer.Meta.fields + ["student_skills"]

    def get_student_skills(self, obj):
        if hasattr(obj, "student_profile") and obj.student_profile:
            # Lấy danh sách kỹ năng đã được prefetch sẵn từ View để tối ưu query
            skills = obj.student_profile.student_skills.all()
            return StudentSkillSerializer(skills, many=True).data
        return []