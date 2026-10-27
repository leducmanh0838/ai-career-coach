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

from django.urls import path
from rest_framework.routers import DefaultRouter

from app.views.ai_view import DocumentAnalysisSSEView
from app.views.apply_view import ApplyJobAPIView, SubmitInterviewAnswerAPIView
from app.views.health_view import health_check
from app.views.auth_view import GoogleLoginAPIView, CookieTokenRefreshAPIView, LoginAPIView, LogoutAPIView
from app.views.job_posting_view import JobPostingViewSet
from app.views.me_view import UserMeAPIView, UserMeDetailAPIView, StudentProfileView, StudentSkillViewSet, \
    MeJobPostingViewSet, UserRecruiterDetailAPIView
from app.views.skill_views import SkillViewSet

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
    path('job-postings/<int:job_id>/apply/', ApplyJobAPIView.as_view(), name='api-apply-job'),
    path('interview/submit/', SubmitInterviewAnswerAPIView.as_view(), name='api-submit-interview'),

    path('skills/<path:pk>/dependencies/', SkillViewSet.as_view({'get': 'dependencies'}), name='skill-dependencies'),
    path('skills/<path:pk>/learning-resources/', SkillViewSet.as_view({'get': 'learning_resources'}),
         name='skill-learning-resources'),
    path('skills/<path:pk>/interview-questions/', SkillViewSet.as_view({'get': 'interview_questions'}),
         name='skill-interview-questions'),
]

# Tự động cộng dồn các đường dẫn từ Router vào urlpatterns
urlpatterns += router.urls
