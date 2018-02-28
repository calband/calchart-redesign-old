"""Django settings for development."""

import os

from . import base as settings
from .base import *  # noqa: F401, F403

SECRET_KEY = 'secret key here'
DEBUG = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(settings.BASE_DIR, 'db.sqlite3'),
    },
}

MEDIA_ROOT = os.path.join(settings.BASE_DIR, '..', 'files')
MEDIA_URL = '/media/'

WEBPACK_PORT = os.environ.get('WEBPACK_PORT', '4200')
STATIC_URL = f'http://localhost:{WEBPACK_PORT}/'

# Uncomment the following line to debug connecting to
# the Members Only API
# MEMBERS_ONLY_DOMAIN = 'http://localhost:8000'
