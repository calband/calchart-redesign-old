"""Utilities for accessing the Members Only API."""

from urllib.parse import quote

from django.conf import settings
from django.core.urlresolvers import reverse

import requests

APP_NAME = 'calchart'
NO_API_MESSAGE = 'Cannot access API if MEMBERS_ONLY_DOMAIN is set to None.'


def get_login_url(request, redirect_url=None):
    """
    Get the URL for the auth-login endpoint in the Members Only API.

    After authenticating, the user is redirected to the given URL (defaults
    to the path of the request).
    """
    base_url = request.build_absolute_uri(reverse('login'))
    if redirect_url is None:
        redirect_url = request.path
    redirect_uri = quote(f'{base_url}?next={redirect_url}')

    if settings.MEMBERS_ONLY_DOMAIN is None:
        raise ValueError(NO_API_MESSAGE)

    return (
        f'{settings.MEMBERS_ONLY_DOMAIN}/api/auth-login/' +
        f'?redirect_uri={redirect_uri}&app_name={APP_NAME}'
    )


def call_endpoint(endpoint, user, method='GET', **params):
    """
    Call the given Members Only API endpoint on behalf of the given user.

    The endpoint is called with the given method and parameters, returning
    the JSON data returned by the API.
    """
    if method == 'GET':
        call = requests.get
    elif method == 'POST':
        call = requests.post
    else:
        raise ValueError

    params['token'] = user.api_token

    if settings.MEMBERS_ONLY_DOMAIN is None:
        raise ValueError(NO_API_MESSAGE)

    r = call(
        f'{settings.MEMBERS_ONLY_DOMAIN}/api/{endpoint}/',
        params=params, timeout=1,
    )
    # error if bad status code
    r.raise_for_status()

    return r.json()
