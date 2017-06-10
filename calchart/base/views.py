from django.conf import settings
from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth.views import LoginView as DjangoLoginView
from django.core.exceptions import PermissionDenied
from django.core.files.storage import default_storage
from django.core.urlresolvers import reverse
from django.http.response import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect
from django.views.generic import TemplateView, RedirectView, CreateView
from django.utils import timezone

import json
from datetime import timedelta

from base.forms import *
from base.mixins import CalchartMixin
from base.models import User, Show
from utils.api import get_login_url

### ENDPOINTS ###

def export(request, slug):
    """
    Return a JSON file to be downloaded automatically.
    """
    show = Show.objects.get(slug=slug)
    response = HttpResponse(show.viewer)
    response['Content-Disposition'] = f'attachment; filename={slug}.json'

    return response

### AUTH PAGES ###

class LoginView(DjangoLoginView):
    """
    Logs in a user with their Members Only credentials. When a user submits their
    credentials, send a request to the Members Only server and validate that the
    credentials are valid. If so, flag the user's session as having logged in.
    """
    template_name = 'login.html'
    redirect_authenticated_user = True

class AuthMembersOnlyView(RedirectView):
    """
    Redirects the user to Members Only, which will redirect back to Calchart after
    the user logs in (or immediately, if the user is already logged in).
    """
    def dispatch(self, request, *args, **kwargs):
        if 'username' in request.GET:
            self.login_user()
            return redirect(request.GET['next']) 
        else:
            return super().dispatch(request, *args, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        redirect_url = self.request.GET['next']
        return get_login_url(self.request, redirect_url)

    def login_user(self):
        username = self.request.GET['username']
        api_token = self.request.GET['api_token']
        ttl_days = self.request.GET['ttl_days']

        user = User.objects.filter(members_only_username=username).first()
        if user is None:
            _username = username
            while User.objects.filter(username=_username).exists():
                _username = f'{username}_'
            user = User.objects.create_user(username=_username, members_only_username=username)

        user.api_token = api_token
        user.api_token_expiry = timezone.now() + timedelta(days=int(ttl_days))
        user.save()

        login(self.request, user)

class CreateUserView(CreateView):
    template_name = 'create_user.html'
    form_class = CreateUserForm

    def form_valid(self, form):
        form.save()
        messages.success(self.request, 'User successfully created.')
        return redirect('login')

### CALCHART PAGES ###

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
                'shows': [
                    {
                        'slug': show.slug,
                        'name': show.name,
                        'published': show.published,
                    }
                    for show in shows
                ],
            })
        else:
            return super().get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['tabs'] = self.get_tabs()
        return context

    def get_tabs(self):
        """
        Get all available tabs for the current user. Available tabs are:
        - band: Shows created by STUNT for this year
        - created: Shows created by the current user

        Returns tabs in a tuple of the form (id, display_name). The first
        tab in the list is the first tab.
        """
        if self.request.user.is_members_only_user():
            year = timezone.now().year
            return [
                ('band', f'{year} Shows'),
                ('owned', 'My Shows'),
            ]
        else:
            return [
                ('owned', 'My Shows'),
            ]

    def get_tab(self, tab):
        """
        Get Shows for the given tab (see get_tabs).
        """
        if tab == 'band':
            if not self.request.user.is_members_only_user():
                raise PermissionDenied
            kwargs = {
                'is_band': True,
                'date_added__year': timezone.now().year,
            }
            if not self.request.user.has_committee('STUNT'):
                kwargs['published'] = True

            return Show.objects.filter(**kwargs)

        if tab == 'owned':
            return Show.objects.filter(owner=self.request.user, is_band=False)

    def create_show(self):
        """
        A POST action that creates a show with a name and audio file
        """
        if self.request.user.has_committee('STUNT'):
            is_band = self.request.POST['is_band'] == 'true'
        else:
            is_band = False

        kwargs = {
            'name': self.request.POST['name'],
            'owner': self.request.user,
            'is_band': is_band,
            'audio_file': self.request.FILES.get('audio'),
        }
        show = Show.objects.create(**kwargs)

        return {
            'url': reverse('editor', kwargs={'slug': show.slug}),
        }

    def publish_show(self):
        """
        A POST action that publishes or unpublishes a show
        """
        published = self.request.POST['publish'] == 'true'
        slug = self.request.POST['slug']

        show = Show.objects.get(slug=slug)
        show.published = published
        show.save()

        if show.viewer_json:
            show.viewer_json['published'] = published
            show.save_viewer_json()

class EditorView(CalchartMixin, TemplateView):
    """
    The editor view that can edit shows
    """
    template_name = 'editor.html'

    def dispatch(self, request, *args, **kwargs):
        self.show = get_object_or_404(Show, slug=kwargs['slug'])

        if self.show.is_band and not self.request.user.has_committee('STUNT'):
            raise PermissionDenied

        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['show'] = self.show
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

class ViewerView(CalchartMixin, TemplateView):
    """
    The view that can view shows
    """
    template_name = 'viewer.html'

    def dispatch(self, request, *args, **kwargs):
        self.show = get_object_or_404(Show, slug=kwargs['slug'])
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['show'] = self.show
        return context

class ViewpsheetView(CalchartMixin, TemplateView):
    """
    The view that generates viewpsheets for a show. Can also pass in
    a dot ID in the GET parameters to initialize the dot to generate
    viewpsheets for.
    """
    template_name = 'viewpsheet.html'

    def dispatch(self, request, *args, **kwargs):
        self.show = get_object_or_404(Show, slug=kwargs['slug'])
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['show'] = self.show
        context['dot'] = self.request.GET.get('dot')
        return context

    def save_settings(self):
        """
        A POST action that saves a user's viewpsheet settings.
        """
        settings = {
            key: self.request.POST[key]
            for key in ['pathOrientation', 'nearbyOrientation', 'birdsEyeOrientation', 'layoutLeftRight']
        }
        settings['layoutLeftRight'] = settings['layoutLeftRight'] == 'true'
        self.request.user.viewpsheet_settings = json.dumps(settings)
        self.request.user.save()
