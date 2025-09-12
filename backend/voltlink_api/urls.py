from django.contrib import admin
from django.urls import path, include
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
from base.views import RegisterView, ForgotPasswordView, ResetPasswordConfirmView
from equipe.views import PessoaViewSet
from cliente.views import ClienteViewSet
from atividade.views import AtividadeViewSet, ComentarioViewSet

@api_view(["GET"])
@permission_classes([AllowAny])
def health_view(request):
    return Response({"status": "ok", "name": "VoltLink API", "auth": "JWT"}, status=200)

router = DefaultRouter()
router.register(r"pessoas", PessoaViewSet, basename="pessoa")
router.register(r"clientes", ClienteViewSet, basename="cliente")
router.register(r"atividades", AtividadeViewSet, basename="atividade")
router.register(r"comentarios", ComentarioViewSet, basename="comentario")

urlpatterns = [
    path("admin/", admin.site.urls),

    # Health (sem auth)
    path("api/health/", health_view, name="health"),

    # Auth (JWT)
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # API principal
    path("api/", include(router.urls)),

    # PAGINA LOGIN
    path("api/auth/register/", RegisterView.as_view()),
    path("api/auth/forgot/",   ForgotPasswordView.as_view()),
    path("api/auth/reset/",    ResetPasswordConfirmView.as_view()),
]