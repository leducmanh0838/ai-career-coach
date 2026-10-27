from rest_framework import serializers
from app.models import (
    JobApplication,
    PersonalizedRoadmap,
    LearningResource,
    InterviewQuestion,
    StudentSkill,
    JobRequiredSkill
)


class LearningResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningResource
        fields = ['id', 'title', 'url', 'description', 'level']


class InterviewQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewQuestion
        fields = ['id', 'question_text', 'sample_answer', 'level']


class StudentSkillDetailSerializer(serializers.ModelSerializer):
    skill_id = serializers.CharField(source='skill.id', read_only=True)
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    skill_name_vi = serializers.CharField(source='skill.name_vi', read_only=True)

    class Meta:
        model = StudentSkill
        fields = ['skill_id', 'skill_name', 'skill_name_vi', 'level']


class JobRequiredSkillDetailSerializer(serializers.ModelSerializer):
    skill_id = serializers.CharField(source='skill.id', read_only=True)
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    skill_name_vi = serializers.CharField(source='skill.name_vi', read_only=True)

    class Meta:
        model = JobRequiredSkill
        fields = ['skill_id', 'skill_name', 'skill_name_vi', 'level']


class PersonalizedRoadmapSerializer(serializers.ModelSerializer):
    skill_id = serializers.CharField(source='skill.id', read_only=True)
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    skill_name_vi = serializers.CharField(source='skill.name_vi', read_only=True)

    learning_resources = serializers.SerializerMethodField()
    interview_questions = serializers.SerializerMethodField()

    class Meta:
        model = PersonalizedRoadmap
        fields = [
            'id',
            'skill_id',
            'skill_name',
            'skill_name_vi',
            'target_level',
            'learning_resources',
            'interview_questions'
        ]

    def get_learning_resources(self, obj):
        resources = LearningResource.objects.filter(skill=obj.skill, level=obj.target_level)
        return LearningResourceSerializer(resources, many=True).data

    def get_interview_questions(self, obj):
        questions = InterviewQuestion.objects.filter(skill=obj.skill, level=obj.target_level)
        return InterviewQuestionSerializer(questions, many=True).data


class JobApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job_posting.title', read_only=True)

    # Lộ trình học tập (các kỹ năng còn thiếu)
    roadmaps = PersonalizedRoadmapSerializer(many=True, read_only=True)

    # Thêm kỹ năng hiện tại của sinh viên
    student_skills = serializers.SerializerMethodField()

    # Thêm kỹ năng yêu cầu của tin tuyển dụng
    job_required_skills = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = [
            'id',
            'job_posting',
            'job_title',
            'created_at',
            'student_skills',
            'job_required_skills',
            'roadmaps'
        ]
        read_only_fields = ['student_profile']

    def get_student_skills(self, obj):
        skills = StudentSkill.objects.filter(student_profile=obj.student_profile).select_related('skill')
        return StudentSkillDetailSerializer(skills, many=True).data

    def get_job_required_skills(self, obj):
        skills = JobRequiredSkill.objects.filter(job=obj.job_posting).select_related('skill')
        return JobRequiredSkillDetailSerializer(skills, many=True).data