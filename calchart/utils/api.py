from django.conf import settings
from django.core.urlresolvers import reverse

from urllib.parse import quote

APP_NAME = 'calchart'

def get_login_url(request, redirect_url=None):
    """
    Get the URL for the auth-login endpoint in the Members Only API. After
    authenticating, the user is redirected to the given URL (defaults to
    the path of the request).
    """
    base_url = request.build_absolute_uri(reverse('login-members-only'))
    if redirect_url is None:
        redirect_url = request.path
    redirect_uri = quote(f'{base_url}?next={redirect_url}')

    if settings.IS_LOCAL:
        domain = 'http://localhost:8000'
    else:
        domain = 'https://membersonly-prod.heroku.com'

    return f'{domain}/api/auth-login/?redirect_uri={redirect_uri}&app_name={APP_NAME}'
