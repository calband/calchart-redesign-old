"""Utility functions for POST actions."""

from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from ..models import Show


def retrieve_show(slug, user):
    """
    Retrieve the Show with the given slug.

    Checks if the user has adequate permissions to view the show.
    """
    show = get_object_or_404(Show, slug=slug)
    if (show.is_band and not user.has_committee('STUNT')):
        raise PermissionDenied
    else:
        return show
