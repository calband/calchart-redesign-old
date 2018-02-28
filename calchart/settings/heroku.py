"""Django settings for Heroku."""

import dj_database_url

from .base import *

HEROKU_APP = os.environ['HEROKU_APP_NAME']
IS_REVIEW = HEROKU_APP.startswith('calchart-staging-pr-')

SECRET_KEY = os.environ['SECRET_KEY']

DEBUG = False
ALLOWED_HOSTS = ['.herokuapp.com']

INSTALLED_APPS.insert(0, 'collectfast')

DATABASES = {
    'default': dj_database_url.config(),
}

# use different directories for review apps
if IS_REVIEW:
    REVIEW_NUM = int(HEROKU_APP.split('calchart-staging-pr-')[1])
    STATICFILES_LOCATION = f'static-pr-{REVIEW_NUM}'
else:
    STATICFILES_LOCATION = 'static'

MEDIAFILES_LOCATION = 'files'

AWS_STORAGE_BUCKET_NAME = os.environ['AWS_BUCKET']
AWS_ACCESS_KEY_ID = os.environ['AWS_ACCESS_KEY']
AWS_SECRET_ACCESS_KEY = os.environ['AWS_SECRET_KEY']
AWS_PRELOAD_METADATA = True
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'

STATICFILES_STORAGE = 'base.custom_storages.StaticStorage'
DEFAULT_FILE_STORAGE = 'base.custom_storages.MediaStorage'
STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/{STATICFILES_LOCATION}/'
MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/{MEDIAFILES_LOCATION}/'

EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_HOST_USER = os.environ['SENDGRID_USERNAME']
EMAIL_HOST_PASSWORD = os.environ['SENDGRID_PASSWORD']
EMAIL_PORT = 587
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = 'Calchart <calband-compcomm@lists.berkeley.edu>'

MEMBERS_ONLY_DOMAIN = 'https://members.calband.org/'
