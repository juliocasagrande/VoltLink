# backend/voltlink_api/settings.py
from pathlib import Path
import os
from datetime import timedelta
import dj_database_url

# .env (carrega variáveis se existirem)
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

BASE_DIR = Path(__file__).resolve().parent.parent

# -------------------------------------------------------------------
# Segurança / Debug
# -------------------------------------------------------------------
SECRET_KEY = os.getenv("SECRET_KEY", "mude-no-.env-ou-railway")
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
ALLOWED_HOSTS = [h for h in os.getenv("ALLOWED_HOSTS", "").split(",") if h] or ["*"]

# Ex.: "https://*.up.railway.app,https://seu-front.up.railway.app,http://localhost:3000"
CSRF_TRUSTED_ORIGINS = [o for o in os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",") if o]

# Se estiver atrás de proxy (Railway), isso ajuda o Django a reconhecer HTTPS
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# -------------------------------------------------------------------
# Apps
# -------------------------------------------------------------------
INSTALLED_APPS = [
    # Staticfiles/WhiteNoise
    "whitenoise.runserver_nostatic",
    "django.contrib.staticfiles",

    # Django core
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",

    # Terceiros
    "rest_framework",
    "corsheaders",
    "django_filters",
    # "rest_framework_simplejwt.token_blacklist",  # habilite se for usar blacklist

    # Apps do projeto
    "base",
    "equipe",
    "cliente",
    "atividade",
]

# -------------------------------------------------------------------
# Middleware (CORS antes do CommonMiddleware / WhiteNoise após Security)
# -------------------------------------------------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "voltlink_api.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "voltlink_api.wsgi.application"

# -------------------------------------------------------------------
# Banco de dados
# - Produção (Railway): usa DATABASE_URL (Postgres)
# - Dev local: SQLite (sem DATABASE_URL definido)
# -------------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
DB_SSL_REQUIRE = os.getenv("DJANGO_DB_SSL_REQUIRE", "True").lower() == "true"  # Railway costuma exigir SSL

if DATABASE_URL:
    # Produção
    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            ssl_require=DB_SSL_REQUIRE,
        )
    }
else:
    # Desenvolvimento local (SQLite)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# -------------------------------------------------------------------
# Senhas
# -------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# -------------------------------------------------------------------
# Localização
# -------------------------------------------------------------------
LANGUAGE_CODE = "pt-br"
TIME_ZONE = "America/Sao_Paulo"
USE_I18N = True
USE_TZ = True

# -------------------------------------------------------------------
# Arquivos estáticos (WhiteNoise)
# -------------------------------------------------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# -------------------------------------------------------------------
# Django REST Framework + JWT
# -------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",  # proteja por padrão
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.OrderingFilter",
        "rest_framework.filters.SearchFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 1000,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=3650),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,  # mude para True se habilitar o app de blacklist
    "UPDATE_LAST_LOGIN": True,
}

# -------------------------------------------------------------------
# CORS (libere só o necessário em produção)
# -------------------------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = os.getenv("CORS_ALLOW_ALL", "False").lower() == "true"
CORS_ALLOW_CREDENTIALS = True

if not CORS_ALLOW_ALL_ORIGINS:
    CORS_ALLOWED_ORIGINS = [
        o for o in os.getenv("CORS_ALLOWED_ORIGINS", "").split(",") if o
    ]
    # Exemplos:
    # CORS_ALLOWED_ORIGINS = [
    #     "http://localhost:3000",
    #     "https://seu-front.up.railway.app",
    # ]

# -------------------------------------------------------------------
# E-mail / utilidades
# -------------------------------------------------------------------
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL = "voltlink@example.com"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")