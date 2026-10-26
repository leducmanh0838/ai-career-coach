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