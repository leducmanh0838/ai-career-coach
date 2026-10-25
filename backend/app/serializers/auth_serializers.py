from rest_framework import serializers
from django.contrib.auth import authenticate


class GoogleLoginSerializer(serializers.Serializer):
    id_token = serializers.CharField(required=True, help_text="Google ID Token từ frontend")


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            # Truyền trực tiếp username nhận từ client vào authenticate
            user = authenticate(
                request=self.context.get('request'),
                username=username,
                password=password
            )

            if not user:
                raise serializers.ValidationError("Tên đăng nhập hoặc mật khẩu không chính xác.")

            if not user.is_active:
                raise serializers.ValidationError("Tài khoản này đã bị khóa.")
        else:
            raise serializers.ValidationError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.")

        attrs['user'] = user
        return attrs
