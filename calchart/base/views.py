from django.views.generic import View, TemplateView, FormView
from django.shortcuts import redirect
from django.contrib import messages

from base.forms import *
from base.mixins import LoginRequiredMixin

class LoginView(FormView):
    """
    Logs in a user with their Members Only credentials. When a user submits their
    credentials, send a request to the Members Only server and validate that the
    credentials are valid. If so, flag the user's session as having logged in.
    """
    template_name = 'login.html'
    form_class = LoginForm

    def dispatch(self, request, *args, **kwargs):
        if request.session.get('valid'):
            return redirect('home')
        else:
            return super(LoginView, self).dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        self.request.session['valid'] = True
        return redirect('home')

def logout_view(request):
    """
    Logs out a user
    """
    try:
        del request.session['valid']
    except:
        pass

    return redirect('login')
