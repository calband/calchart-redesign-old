"""
Django settings for calchart
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# environment checks: based on the environment variables, we can determine what
# environment the app is running in
IS_HEROKU = bool(os.environ.get('IS_HEROKU'))
IS_REVIEW = IS_HEROKU and bool(os.environ.get('IS_REVIEW'))
IS_PROD = IS_HEROKU and not IS_REVIEW
IS_LOCAL = not IS_HEROKU

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.7/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'shhhhhdonttellanyoneaboutthispassworditsasecret')

DEBUG = IS_LOCAL

if IS_HEROKU:
    # update to the new domain
    ALLOWED_HOSTS = ['.herokuapp.com']
else:
    ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = (
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'storages',
    'base',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
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
        }
    }
]

# Database
# https://docs.djangoproject.com/en/1.7/ref/settings/#databases

if IS_HEROKU:
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.config()
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': 'calchart_db',
            'USER': 'calchart_user',
            'PASSWORD': 'calbandgreat',
            'HOST': '127.0.0.1',
        },
    }

# Internationalization
# https://docs.djangoproject.com/en/1.7/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'US/Pacific'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)

STATIC_URL = '/static/'
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'static'),
)

STATICFILES_LOCATION = 'static'
MEDIAFILES_LOCATION = 'files'

# use different directories for review apps
if IS_REVIEW:
    review_num = int(os.environ['HEROKU_APP_NAME'].split('calchart-server-pr-')[1])
    STATICFILES_LOCATION = 'static-pr-%d' % review_num

# use local static files for development
if IS_HEROKU:
    AWS_S3_HOST = 's3-us-west-1.amazonaws.com'
    AWS_STORAGE_BUCKET_NAME = os.environ['AWS_BUCKET']
    AWS_ACCESS_KEY_ID = os.environ['AWS_ACCESS_KEY']
    AWS_SECRET_ACCESS_KEY = os.environ['AWS_SECRET_KEY']
    AWS_PRELOAD_METADATA = True
    AWS_S3_CUSTOM_DOMAIN = '%s.s3.amazonaws.com' % AWS_STORAGE_BUCKET_NAME

    STATICFILES_STORAGE = 'base.custom_storages.StaticStorage'
    STATIC_URL = 'https://%s/%s/' % (AWS_S3_CUSTOM_DOMAIN, STATICFILES_LOCATION)
    MEDIA_URL = 'https://%s/%s/' % (AWS_S3_CUSTOM_DOMAIN, MEDIAFILES_LOCATION)
    DEFAULT_FILE_STORAGE = 'base.custom_storages.MediaStorage'
else:
    MEDIA_ROOT = '../files/'

LOGIN_REDIRECT_URL = 'home'
LOGIN_URL = 'login'