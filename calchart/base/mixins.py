from django.contrib.auth.mixins import AccessMixin
from django.shortcuts import redirect

from utils.api import get_login_url


class LoginRequiredMixin(AccessMixin):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return self.handle_no_permission()

        # if not valid token, reauthenticate user
        if not request.user.is_valid_api_token():
            login_url = get_login_url(self.request)
            return redirect(login_url)

        self.post_auth(request, *args, **kwargs)

        return super().dispatch(request, *args, **kwargs)

    def post_auth(self, request, *args, **kwargs):
        """A hook for actions after user is authenticated."""
        pass
