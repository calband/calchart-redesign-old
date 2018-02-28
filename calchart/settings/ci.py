"""Django settings for CI."""

from .dev import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'circle_test',
        'USER': 'root',
        'HOST': '127.0.0.1',
    },
}

STATIC_URL = '/static/'

# if MEMBERS_ONLY_DOMAIN was uncommented for development,
# it should be commented out again in testing.
assert MEMBERS_ONLY_DOMAIN is None
