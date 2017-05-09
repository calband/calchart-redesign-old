from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib.auth.views import LogoutView

from base.views import *

urlpatterns = [
    url(r'^$', HomeView.as_view(), name='home'),
    url(r'^editor/(?P<slug>.+)/$', EditorView.as_view(), name='editor'),
    url(r'^help/', include('wiki.urls', namespace='wiki')),

    # authentication
    url(r'^login/$', LoginView.as_view(), name='login'),
    url(r'^auth/members-only/$', AuthMembersOnlyView.as_view(), name='login'),
    url(r'^logout/$', LogoutView.as_view(), name='logout'),

    # endpoints for server-side processing
    url(r'^download/(?P<slug>\w+)\.json$', export),
]

# for development
# https://docs.djangoproject.com/en/1.10/howto/static-files/#serving-files-uploaded-by-a-user-during-development
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
