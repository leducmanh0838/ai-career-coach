from django.contrib.postgres.search import SearchVector, SearchQuery
from rest_framework import viewsets, filters
from app.models import Skill
from app.serializers.skill_serializers import SkillSerializer


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SkillSerializer

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