"""Custom boto storage classes."""

from django.conf import settings
from storages.backends.s3boto import S3BotoStorage


class StaticStorage(S3BotoStorage):
    """Custom Boto storage for static files."""

    location = settings.STATICFILES_LOCATION


class MediaStorage(S3BotoStorage):
    """Custom Boto storage for media files."""

    location = settings.MEDIAFILES_LOCATION
