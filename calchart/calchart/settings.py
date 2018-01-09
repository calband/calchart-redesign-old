"""Django settings for Calchart."""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# environment checks: based on the environment variables, we can determine what
# environment the app is running in
IS_CI = bool(os.environ.get('CIRCLECI'))
IS_PROD = bool(os.environ.get('CALCHART_PROD'))
IS_STAGING = bool(os.environ.get('CALCHART_STAGING'))
HEROKU_APP = os.environ.get('HEROKU_APP_NAME', '')
IS_REVIEW = HEROKU_APP.startswith('calchart-staging-pr-')
IS_HEROKU = IS_STAGING or IS_PROD or IS_REVIEW
IS_LOCAL = not IS_HEROKU and not IS_CI

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.7/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get(
    'SECRET_KEY',
    'shhhhhdonttellanyoneaboutthispassworditsasecret',
)

DEBUG = not IS_HEROKU

if IS_HEROKU:
    # update to the new domain
    ALLOWED_HOSTS = ['.herokuapp.com']

# Application definition

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'storages',
    'base',
    'wiki',  # help pages
]

if IS_HEROKU:
    # collectfast staticfiles
    INSTALLED_APPS.insert(0, 'collectfast')

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'calchart.urls'

WSGI_APPLICATION = 'calchart.wsgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'OPTIONS': {
            'context_processors': (
                'django.template.context_processors.debug',
                'django.template.context_processors.i18n',
                'django.template.context_processors.media',
                'django.template.context_processors.request',
                'django.template.context_processors.static',
                'django.template.context_processors.tz',
                'django.contrib.messages.context_processors.messages',
            ),
        },
    },
]

# Database
# https://docs.djangoproject.com/en/1.7/ref/settings/#databases

if IS_HEROKU:
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.config(),
    }
elif IS_CI:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': 'circle_test',
            'USER': 'root',
            'HOST': '127.0.0.1',
        },
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': os.environ.get('POSTGRES_DB', 'postgres'),
            'USER': os.environ.get('POSTGRES_USER', 'postgres'),
            'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'calbandgreat'),
            'HOST': os.environ.get('POSTGRES_HOST', '127.0.0.1'),
        },
    }

# Internationalization
# https://docs.djangoproject.com/en/1.7/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'US/Pacific'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Fixtures
FIXTURE_DIRS = (
    os.path.join(BASE_DIR, 'fixtures'),
)

# Static files (CSS, JavaScript, Images)
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'static'),
)

STATICFILES_LOCATION = 'static'
MEDIAFILES_LOCATION = 'files'

# use different directories for review apps
if IS_REVIEW:
    review_num = int(HEROKU_APP.split('calchart-staging-pr-')[1])
    STATICFILES_LOCATION = f'static-pr-{review_num}'

# use local static files for development
if IS_HEROKU:
    if IS_PROD:
        AWS_STORAGE_BUCKET_NAME = os.environ['AWS_BUCKET_PROD']
    elif IS_REVIEW:
        AWS_STORAGE_BUCKET_NAME = os.environ['AWS_BUCKET_REVIEW']
    else:
        AWS_STORAGE_BUCKET_NAME = os.environ['AWS_BUCKET_STAGING']

    AWS_ACCESS_KEY_ID = os.environ['AWS_ACCESS_KEY']
    AWS_SECRET_ACCESS_KEY = os.environ['AWS_SECRET_KEY']
    AWS_PRELOAD_METADATA = True
    AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'

    STATICFILES_STORAGE = 'base.custom_storages.StaticStorage'
    DEFAULT_FILE_STORAGE = 'base.custom_storages.MediaStorage'
    STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/{STATICFILES_LOCATION}/'
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/{MEDIAFILES_LOCATION}/'

    # email settings
    EMAIL_HOST = 'smtp.sendgrid.net'
    EMAIL_HOST_USER = os.environ['SENDGRID_USERNAME']
    EMAIL_HOST_PASSWORD = os.environ['SENDGRID_PASSWORD']
    EMAIL_PORT = 587
    EMAIL_USE_TLS = True
    DEFAULT_FROM_EMAIL = 'Calchart <calband-compcomm@lists.berkeley.edu>'
else:
    MEDIA_ROOT = os.path.join(BASE_DIR, '..', 'files')
    MEDIA_URL = '/media/'

    if IS_CI:
        STATIC_URL = '/static/'
    else:
        webpack_port = os.environ.get('WEBPACK_PORT', '4200')
        STATIC_URL = f'http://localhost:{webpack_port}/'

# Authentication

AUTH_USER_MODEL = 'base.User'

LOGIN_REDIRECT_URL = 'home'
LOGIN_URL = 'login'
LOGOUT_REDIRECT_URL = 'login'
LOGOUT_URL = 'logout'
