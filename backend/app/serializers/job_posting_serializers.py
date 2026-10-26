from rest_framework import serializers

from app.models import JobRequiredSkill, JobPosting


class JobRequiredSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source="skill.name", read_only=True)

    class Meta:
        model = JobRequiredSkill
        fields = [
            "id",
            "skill",
            "skill_name",
            "level",
            "reasoning",
            "evidence",
        ]
        read_only_fields = ["id", "evidence"]


class JobPostingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = ["id", "title", "status", "description", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

class JobPostingDetailSerializer(serializers.ModelSerializer):
    required_skills = JobRequiredSkillSerializer(many=True, read_only=True)

    class Meta:
        model = JobPosting
        fields = [
            "id",
            "title",
            "description",
            "status",
            "required_skills",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
