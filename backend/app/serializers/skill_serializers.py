from rest_framework import serializers
from app.models import StudentSkill, Skill


class SkillBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "name_vi", "skill_type", "description_vi"]


class StudentSkillSerializer(serializers.ModelSerializer):
    # Trả về thông tin chi tiết của skill khi GET
    skill = SkillBasicSerializer(read_only=True)

    # Dùng để nhận id của Skill từ Frontend khi Thêm/Sửa (POST/PUT/PATCH)
    skill_id = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        source="skill",
        write_only=True,
        required=True
    )

    class Meta:
        model = StudentSkill
        fields = ["id", "skill", "skill_id", "level", "reasoning", "evidence", "status"]
        read_only_fields = ["status"]


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = [
            "id", "name", "name_vi", "skill_type",
            "synonyms", "description", "synonyms_vi", "description_vi", "is_verified"
        ]
