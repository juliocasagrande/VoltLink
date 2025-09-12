# backend/base/views.py
from django.contrib.auth.models import User
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)

    def validate_username(self, v):
        if User.objects.filter(username=v).exists():
            raise serializers.ValidationError("Usuário já existe.")
        return v

    def create(self, data):
        return User.objects.create_user(
            username=data["username"],
            email=data["email"],
            password=data["password"],
            is_active=True,
        )

class RegisterView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        s = RegisterSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        s.save()
        return Response({"ok": True}, status=201)


class ForgotSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ForgotPasswordView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        s = ForgotSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        email = s.validated_data["email"]
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # não revela se existe; devolve 204
            return Response(status=204)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f'{settings.FRONTEND_URL}/reset-senha/{uid}/{token}'

        send_mail(
            subject="VoltLink - Redefinição de senha",
            message=f"Clique para redefinir sua senha: {reset_link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=True,
        )
        return Response(status=204)


class ResetSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=6)


class ResetPasswordConfirmView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        s = ResetSerializer(data=request.data)
        s.is_valid(raise_exception=True)

        try:
            uid = force_str(urlsafe_base64_decode(s.validated_data["uid"]))
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({"detail": "Link inválido."}, status=400)

        token = s.validated_data["token"]
        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Token inválido."}, status=400)

        user.set_password(s.validated_data["new_password"])
        user.save()
        return Response({"ok": True})