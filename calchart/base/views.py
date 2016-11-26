from django.views.generic import View, TemplateView, FormView
from django.shortcuts import redirect
from django.contrib import messages
from django.http.response import JsonResponse

import json

from base.forms import *
from base.menus import *
from base.mixins import LoginRequiredMixin, ActionsMixin
from base.models import Show

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
        self.request.session['username'] = form.cleaned_data['username']
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

class HomeView(LoginRequiredMixin, ActionsMixin, TemplateView):
    """
    The home page that lists all shows created by the user and shared
    by the STUNT committee in a Google Drive-like format.
    """
    template_name = 'home.html'

    def get(self, request, *args, **kwargs):
        """
        Tabs are loaded with AJAX requests that contain the "tab" key
        in the query string
        """
        if 'tab' in request.GET:
            shows = self.get_tab(request.GET['tab'])
            return JsonResponse({
                'shows': shows,
            })
        else:
            return super(HomeView, self).get(request, *args, **kwargs)

    def get_tab(self, tab):
        # for now, show all shows for current user
        return Show.objects.filter(owner=self.request.session['username'])

    def create_show(self):
        """
        A POST action that creates a show with a name and audio file
        """
        kwargs = {
            'name': self.request.POST['name'],
            'owner': self.request.session['username'],
            'audio_file': self.request.FILES['audio'],
        }
        show = Show.objects.create(**kwargs)
        return redirect('editor', slug=show.slug)

class EditorView(LoginRequiredMixin, ActionsMixin, TemplateView):
    """
    The editor view that can edit shows
    """
    template_name = 'editor.html'

    def dispatch(self, request, *args, **kwargs):
        self.show = Show.objects.get(slug=kwargs['slug'])
        return super(EditorView, self).dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(EditorView, self).get_context_data(**kwargs)
        context['show'] = self.show
        context['menu'] = editor_menu
        context['tool_panel'] = editor_tools
        return context

    def save_show(self):
        """
        A POST action that saves a show's JSON data
        """
        self.show.viewer = self.request.POST['viewer']
        self.show.save()