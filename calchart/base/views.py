from django.views.generic import View, TemplateView, FormView
from django.shortcuts import redirect
from django.contrib import messages
from django.http.response import HttpResponse, JsonResponse
from django.core.files.storage import default_storage
from django.conf import settings

import json, os

from base.forms import LoginForm, editor_popups
from base.menus import *
from base.mixins import CalchartMixin
from base.models import Show

### ENDPOINTS ###

def export(request, slug):
    """
    Return a JSON file to be downloaded automatically.
    """
    show = Show.objects.get(slug=slug)
    response = HttpResponse(show.viewer)
    response['Content-Disposition'] = f'attachment; filename={slug}.json'

    return response

### PAGES ###

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
            return super().dispatch(request, *args, **kwargs)

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

class HomeView(CalchartMixin, TemplateView):
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
            return super().get(request, *args, **kwargs)

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

class EditorView(CalchartMixin, TemplateView):
    """
    The editor view that can edit shows
    """
    template_name = 'editor.html'
    popup_forms = editor_popups

    def dispatch(self, request, *args, **kwargs):
        self.show = Show.objects.get(slug=kwargs['slug'])
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(EditorView, self).get_context_data(**kwargs)
        context['show'] = self.show
        context['menu'] = editor_menu
        context['toolbar'] = editor_toolbar
        context['is_local'] = settings.IS_LOCAL
        context['panels'] = [
            ('partials/panel_edit_continuity.html', 'edit-continuity'),
            ('partials/panel_edit_continuity_dots.html', 'edit-continuity-dots'),
            ('partials/panel_ftl_path.html', 'ftl-path'),
            ('partials/panel_select_dots.html', 'select-dots'),
            ('partials/panel_two_step.html', 'two-step'),
        ]
        return context

    def save_show(self):
        """
        A POST action that saves a show's JSON data.
        """
        self.show.viewer = self.request.POST['viewer']
        self.show.save()

    def upload_sheet_image(self):
        """
        A POST action that uploads an image for a given sheet in the show.
        """
        sheet = self.request.POST['sheet']
        image = self.request.FILES['image']
        filename = f'backgrounds/{self.show.slug}/{image.name}'
        if default_storage.exists(filename):
            default_storage.delete(filename)
        filename = default_storage.save(filename, image)

        return JsonResponse({
            'url': settings.MEDIA_URL + filename,
        })
