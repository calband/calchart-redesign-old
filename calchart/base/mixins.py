"""Mixins for views in the base app."""

from django.contrib.auth.mixins import AccessMixin
from django.shortcuts import redirect

from utils.api import get_login_url


class LoginRequiredMixin(AccessMixin):
    """A mixin for requiring a logged-in user for a view."""

    def dispatch(self, request, *args, **kwargs):
        """Dispatch the given HTTP request."""
        if not request.user.is_authenticated:
            return self.handle_no_permission()

        # if not valid token, reauthenticate user
        if not request.user.is_valid_api_token():
            login_url = get_login_url(self.request)
            return redirect(login_url)

        self.post_auth(request, *args, **kwargs)

        return super().dispatch(request, *args, **kwargs)

    def post_auth(self, request, *args, **kwargs):
        """Do actions after authenticating the user."""
        pass
