from django.contrib.auth.mixins import AccessMixin
from django.core.urlresolvers import reverse
from django.shortcuts import redirect

class LoginRequiredMixin(AccessMixin):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return self.handle_no_permission()

        # TODO: check valid token, if not, reauthenticate user

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

        response = getattr(self, action)()
        if response is None:
            return redirect(request.path)
        else:
            return response

class PopupMixin(object):
    """
    Views with this mixin can define forms in the `popup_forms` class variable
    that will be rendered in the HTML as popup boxes.
    """
    popup_forms = []

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['popup_forms'] = [PopupForm() for PopupForm in self.popup_forms]
        return context

class CalchartMixin(LoginRequiredMixin, ActionsMixin, PopupMixin):
    pass
