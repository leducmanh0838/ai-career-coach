from rest_framework import serializers
from app.models import StudentSkill, Skill, SkillDependency, LearningResource, InterviewQuestion


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
        fields = ["id", "skill", "skill_id", "level", "reasoning", "evidence"]


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = [
            "id", "name", "name_vi", "skill_type",
            "synonyms", "description", "synonyms_vi", "description_vi", "is_verified"
        ]


class SkillDependencySerializer(serializers.ModelSerializer):
    related_skill = SkillBasicSerializer(read_only=True)
    relation_type_display = serializers.CharField(source='get_relation_type_display', read_only=True)

    class Meta:
        model = SkillDependency
        fields = ['id', 'related_skill', 'relation_type', 'relation_type_display']


class LearningResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningResource
        fields = ['id', 'title', 'url', 'description', 'level']


class InterviewQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewQuestion
        fields = ['id', 'question_text', 'sample_answer', 'level']
