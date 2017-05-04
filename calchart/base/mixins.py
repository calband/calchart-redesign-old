from django.core.urlresolvers import reverse
from django.shortcuts import redirect

class LoginRequiredMixin(object):
    """
    Checks that a user is logged in.
    """
    def dispatch(self, request, *args, **kwargs):
        if not request.session.get('valid'):
            url = reverse('login')
            return redirect(f'{url}?next={request.path}')
        else:
            return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['username'] = self.request.session['username']
        return context

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
            response = getattr(self, action)()
            return response or redirect('home')
        except:
            return super().post(request, *args, **kwargs)

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
