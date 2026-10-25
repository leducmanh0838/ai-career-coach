from django.conf import settings
from django.contrib.auth import get_user_model
from google.auth.transport import requests
from google.oauth2 import id_token
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from app.serializers.auth_serializers import GoogleLoginSerializer, LoginSerializer

User = get_user_model()


class GoogleLoginAPIView(APIView):
    authentication_classes = []

    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        token = serializer.validated_data['id_token']

        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID,
                clock_skew_in_seconds=10,
            )

            email = idinfo.get('email')
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            avatar_url = idinfo.get('picture', '')

            if not email:
                return Response(
                    {"error": "Google account does not provide an email."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user, created = User.objects.get_or_create(
                username=email,
                defaults={
                    'email': email,
                    'first_name': first_name,
                    'last_name': last_name,
                    'avatar_url': avatar_url,
                    'role': 'student',
                }
            )

            if not created and not user.avatar_url and avatar_url:
                user.avatar_url = avatar_url
                user.save(update_fields=['avatar_url'])

            # 1. Sinh JWT Token
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # 2. Tạo Response chứa thông tin user (không chứa token trong body)
            response = Response({
                "message": "Đăng nhập thành công",
                "is_created": created,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                    "avatar_url": user.avatar_url,
                }
            }, status=status.HTTP_200_OK)

            # 3. Gán Access Token vào HttpOnly Cookie (Sống ngắn, ví dụ: 30 phút)
            response.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=not settings.DEBUG,  # True khi chạy production (HTTPS), False khi chạy local (HTTP)
                samesite='Lax',  # Hoặc 'None' nếu frontend và backend khác hẳn domain trên production
                max_age=30 * 60  # 30 phút tính bằng giây
            )

            # 4. Gán Refresh Token vào HttpOnly Cookie (Sống dài, ví dụ: 7 ngày)
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax',
                max_age=7 * 24 * 60 * 60  # 7 ngày
            )

            return response

        except ValueError as e:
            return Response(
                {"error": f"Invalid Google token: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )


class LoginAPIView(APIView):
    authentication_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = Response({
            "message": "Đăng nhập thành công",
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
                "avatar_url": getattr(user, 'avatar_url', ''),
            }
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            max_age=30 * 60
        )

        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            max_age=7 * 24 * 60 * 60
        )

        return response


class CookieTokenRefreshAPIView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        # 1. Lấy Refresh Token từ HttpOnly Cookie
        refresh_token_str = request.COOKIES.get('refresh_token')

        if not refresh_token_str:
            return Response(
                {"error": "Refresh token not found in cookies."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            # 2. Khởi tạo đối tượng RefreshToken từ chuỗi token
            refresh = RefreshToken(refresh_token_str)

            # 3. Lấy user_id từ payload của token để truy vấn thông tin user
            user_id = refresh.payload.get('user_id')
            user = User.objects.get(id=user_id)

            # 4. Sinh Access Token mới
            new_access_token = str(refresh.access_token)

            # 5. Tạo Response chứa thông tin user (giống hệt khi đăng nhập)
            response = Response({
                "message": "Làm mới token thành công",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                    "avatar_url": user.avatar_url,
                }
            }, status=status.HTTP_200_OK)

            # 6. Gán Access Token mới vào HttpOnly Cookie
            response.set_cookie(
                key='access_token',
                value=new_access_token,
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax',
                max_age=2 * 60 * 60  # 2 giờ (khớp với cấu hình bài thi của bạn)
            )

            if settings.SIMPLE_JWT.get('ROTATE_REFRESH_TOKENS', False):
                new_refresh = RefreshToken.for_user(user)
                response.set_cookie(
                    key='refresh_token',
                    value=str(new_refresh),
                    httponly=True,
                    secure=not settings.DEBUG,
                    samesite='Lax',
                    max_age=24 * 60 * 60  # 1 ngày
                )

            return response

        except (TokenError, User.DoesNotExist) as e:
            return Response(
                {"error": f"Invalid or expired refresh token: {str(e)}"},
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutAPIView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        response = Response({"message": "Đăng xuất thành công"}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')

        return response
