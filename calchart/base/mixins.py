from django.conf import settings
from django.contrib.auth.mixins import AccessMixin
from django.core.urlresolvers import reverse
from django.http import HttpResponse, JsonResponse
from django.middleware.csrf import get_token
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

        return super(LoginRequiredMixin, self).dispatch(request, *args, **kwargs)

    def post_auth(self, request, *args, **kwargs):
        """A hook for actions after user is authenticated."""
        pass

class ActionsMixin(object):
    """
    Views with this mixin can accept POST requests with 'action' in
    the POST data that will route any actions to the corresponding
    function. For example, POST data sent with the action "save_show"
    will route to the "save_show" function, if available.
    """
    def post(self, request, *args, **kwargs):
        try:
            action = request.POST['action']
        except KeyError:
            return super().post(request, *args, **kwargs)

        try:
            response = getattr(self, action)()
        except Exception as e:
            if isinstance(e, AttributeError):
                message = f'Action does not exist: {action}'
            else:
                message = str(e)

            data = {
                'message': message,
            }
            return JsonResponse(data, status=500)

        if response is None:
            return JsonResponse({})
        elif isinstance(response, HttpResponse):
            return response
        else:
            return JsonResponse(response)

class EnvMixin(object):
    """
    Add context variables to indicate various environment flags.
    """
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['env'] = {
            'csrf_token': get_token(self.request),
            'static_path': settings.STATIC_URL[:-1],
            'is_stunt': self.request.user.has_committee('STUNT'),
            'is_local': settings.IS_LOCAL,
        }
        return context

class CalchartMixin(LoginRequiredMixin, ActionsMixin, EnvMixin):
    pass
