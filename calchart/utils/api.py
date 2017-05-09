from django.conf import settings
from django.core.urlresolvers import reverse

from urllib.parse import quote

APP_NAME = 'calchart'

def get_login_url(redirect_url):
    """
    Get the URL for the auth-login endpoint in the Members Only API. After
    authenticating, the user is redirected to the given URL.
    """
    redirect_uri = quote(redirect_url)

    if settings.IS_LOCAL:
        domain = 'http://localhost:8000'
    else:
        domain = 'https://membersonly-prod.heroku.com'

    return f'{domain}/api/auth-login/?redirect_uri={redirect_uri}&app_name={APP_NAME}'
