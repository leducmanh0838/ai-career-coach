from rest_framework import serializers

class GoogleLoginSerializer(serializers.Serializer):
    id_token = serializers.CharField(required=True, help_text="Google ID Token từ frontend")