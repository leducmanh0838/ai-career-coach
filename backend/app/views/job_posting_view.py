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

from rest_framework import viewsets
from rest_framework.filters import SearchFilter
from app.models import JobPosting
from app.serializers.job_posting_serializers import JobPostingDetailSerializer, JobPostingSerializer


class JobPostingViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API xem danh sách và chi tiết tin tuyển dụng (Read-Only).
    """
    queryset = JobPosting.objects.all()
    filter_backends = [SearchFilter]

    # Cho phép tìm kiếm theo tiêu đề tin hoặc tên kỹ năng (qua ?search=...)
    search_fields = ['title', 'required_skills__skill__name', 'required_skills__skill__name_vi']

    def get_serializer_class(self):
        """Dùng JobPostingDetailSerializer khi xem chi tiết, ngược lại dùng JobPostingSerializer"""
        if self.action == 'retrieve':
            return JobPostingDetailSerializer
        return JobPostingSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # 1. Khi xem danh sách: Chỉ lấy các tin đang tuyển (published)
        if self.action == 'list':
            queryset = queryset.filter(status=JobPosting.Status.PUBLISHED)

        # 2. Khi xem chi tiết: Join sẵn bảng required_skills và skill để tối ưu performance
        elif self.action == 'retrieve':
            queryset = queryset.prefetch_related(
                'required_skills',
                'required_skills__skill'
            )

        return queryset