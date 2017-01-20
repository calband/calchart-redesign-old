from django.conf.urls import include, url

from base.views import *

urlpatterns = [
    url(r'^$', HomeView.as_view(), name='home'),
    url(r'^login/$', LoginView.as_view(), name='login'),
    url(r'^logout/$', logout_view, name='logout'),
    url(r'^editor/(?P<slug>\w+)/$', EditorView.as_view(), name='editor'),

    # endpoints for server-side processing
    url(r'^download/(?P<slug>\w+)\.json$', export),
]
