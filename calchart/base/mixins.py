from django.contrib.auth.mixins import AccessMixin
from django.core.urlresolvers import reverse
from django.http import HttpResponse, JsonResponse
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

        return super(LoginRequiredMixin, self).dispatch(request, *args, **kwargs)

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
            data = {
                'message': str(e),
            }
            return JsonResponse(data, status=500)

        if response is None:
            return redirect(request.path)
        elif isinstance(response, HttpResponse):
            return response
        else:
            return JsonResponse(response)

class CalchartMixin(LoginRequiredMixin, ActionsMixin):
    pass
