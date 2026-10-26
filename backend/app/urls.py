from django.urls import path
from rest_framework.routers import DefaultRouter

from app.views.ai_view import DocumentAnalysisSSEView
from app.views.health_view import health_check
from app.views.auth_view import GoogleLoginAPIView, CookieTokenRefreshAPIView, LoginAPIView, LogoutAPIView
from app.views.job_posting_view import JobPostingViewSet
from app.views.me_view import UserMeAPIView, UserMeDetailAPIView, StudentProfileView, StudentSkillViewSet, \
    MeJobPostingViewSet, UserRecruiterDetailAPIView
from app.views.skill_views import SkillViewSet

# Khởi tạo Router cho StudentSkillViewSet (tự động sinh ra các endpoint list, create, retrieve, update, destroy)
router = DefaultRouter()
router.register(r'me/skills', StudentSkillViewSet, basename='me-student-skills')
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r"me/job-postings", MeJobPostingViewSet, basename="my-job-posting")
router.register(r'job-postings', JobPostingViewSet, basename='jobposting')

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('auth/google/', GoogleLoginAPIView.as_view(), name='google_login'),
    path('auth/login/', LoginAPIView.as_view(), name='password-login'),
    path('auth/logout/', LogoutAPIView.as_view(), name='auth_logout'),
    path('auth/refresh/', CookieTokenRefreshAPIView.as_view(), name='token-refresh'),
    path("ai/analyze-stream", DocumentAnalysisSSEView.as_view(), name="ai-analyze-stream"),
    path("me/", UserMeAPIView.as_view(), name="current user"),
    path("me/detail/", UserMeDetailAPIView.as_view(), name="current user detail"),
    path("me/student/", UserMeDetailAPIView.as_view(), name="current user detail"),
    path("me/recruiter/", UserRecruiterDetailAPIView.as_view(), name="current recruiter detail"),
    path('me/student-profile/', StudentProfileView.as_view(), name='me-student-profile'),
]

# Tự động cộng dồn các đường dẫn từ Router vào urlpatterns
urlpatterns += router.urls
