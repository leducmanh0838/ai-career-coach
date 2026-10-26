from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)
        raw_token = None
        is_from_cookie = False

        if header is not None:
            raw_token = self.get_raw_token(header)

        if raw_token is None:
            cookie_token = request.COOKIES.get('access_token')
            if cookie_token is not None:
                raw_token = cookie_token.encode('utf-8')
                is_from_cookie = True

        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except (InvalidToken, TokenError):
            if is_from_cookie:
                return None

            raise
