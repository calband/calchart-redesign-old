"""General actions for the application."""

from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from ..models import Show


def get_show(data, **kwargs):
    """Get the show with the given slug."""
    user = kwargs['user']
    show = get_object_or_404(Show, slug=data['slug'])

    if (show.is_band and not user.has_committee('STUNT')):
        raise PermissionDenied
    elif show.data_file:
        return {
            'isInitialized': True,
            'show': show.get_data(),
        }
    else:
        return {
            'isInitialized': False,
            'name': show.name,
            'slug': show.slug,
            'isBand': show.is_band,
        }
