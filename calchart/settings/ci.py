"""Django settings for CI."""

from . import dev as settings
from .dev import *  # noqa: F401, F403

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
assert settings.MEMBERS_ONLY_DOMAIN is None
