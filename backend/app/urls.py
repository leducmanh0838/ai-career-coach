from django.urls import path

from app.views.ai_view import DocumentAnalysisSSEView
from app.views.health_view import health_check
from app.views.auth_view import GoogleLoginAPIView, CookieTokenRefreshAPIView
from app.views.me_view import UserMeAPIView, UserMeDetailAPIView

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('auth/google/', GoogleLoginAPIView.as_view(), name='google_login'),
    path('auth/refresh/', CookieTokenRefreshAPIView.as_view(), name='token-refresh'),
    path("ai/analyze-stream", DocumentAnalysisSSEView.as_view(), name="ai-analyze-stream"),
    path("me/", UserMeAPIView.as_view(), name="current user"),
    path("me/detail/", UserMeDetailAPIView.as_view(), name="current user detail"),
]
