from django.urls import path
from app.views.health import health_check
from app.views.auth import GoogleLoginAPIView, CookieTokenRefreshAPIView

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('auth/google/', GoogleLoginAPIView.as_view(), name='google_login'),
    path('auth/refresh/', CookieTokenRefreshAPIView.as_view(), name='token-refresh'),
]
