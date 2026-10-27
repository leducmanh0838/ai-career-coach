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

from django.contrib.postgres.search import SearchVector, SearchQuery
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from app.models import Skill, SkillDependency, LearningResource, InterviewQuestion
from app.serializers.skill_serializers import (
    SkillSerializer,
    SkillDependencySerializer,
    LearningResourceSerializer,
    InterviewQuestionSerializer
)

class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SkillSerializer
    # Xóa dòng lookup_value_regex đi để tránh lỗi greedy regex

    def get_queryset(self):
        queryset = Skill.objects.all().order_by('name')
        query = self.request.query_params.get('q', None)

        if query:
            search_vector = (
                SearchVector('name', weight='A', config='simple') +
                SearchVector('synonyms', weight='B', config='simple') +
                SearchVector('name_vi', weight='A', config='simple') +
                SearchVector('synonyms_vi', weight='B', config='simple')
            )
            search_query = SearchQuery(query, config='simple')

            queryset = queryset.annotate(
                search=search_vector
            ).filter(search=search_query)

        return queryset

    # Giữ nguyên các hàm @action bình thường
    @action(detail=True, methods=['get'])
    def dependencies(self, request, pk=None):
        skill = self.get_object()
        dependencies = SkillDependency.objects.filter(source_skill=skill).select_related('related_skill')
        serializer = SkillDependencySerializer(dependencies, many=True)
        return Response({"message": "Thành công", "data": serializer.data}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='learning-resources')
    def learning_resources(self, request, pk=None):
        skill = self.get_object()
        resources = LearningResource.objects.filter(skill=skill)
        level = request.query_params.get('level', None)
        if level:
            resources = resources.filter(level=level)
        serializer = LearningResourceSerializer(resources, many=True)
        return Response({"message": "Thành công", "data": serializer.data}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='interview-questions')
    def interview_questions(self, request, pk=None):
        skill = self.get_object()
        questions = InterviewQuestion.objects.filter(skill=skill)
        level = request.query_params.get('level', None)
        if level:
            questions = questions.filter(level=level)
        serializer = InterviewQuestionSerializer(questions, many=True)
        return Response({"message": "Thành công", "data": serializer.data}, status=status.HTTP_200_OK)