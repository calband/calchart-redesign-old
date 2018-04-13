"""URL patterns for Calchart."""

from calchart.views import (
    CalchartView,
    DevView,
    LoginView,
    export,
)

from django.conf import settings
from django.conf.urls import url
from django.conf.urls.static import static
from django.contrib.auth.views import LogoutView

urlpatterns = [
    url(r'^$', CalchartView.as_view(), name='home'),
    url(r'^create-show', CalchartView.as_view()),
    url(r'^editor', CalchartView.as_view()),
    url(r'^viewer', CalchartView.as_view()),
    url(r'^viewpsheet', CalchartView.as_view()),
    # url(r'^help/', include('wiki.urls', namespace='wiki')),

    # authentication
    url(r'^login/$', LoginView.as_view(), name='login'),
    url(r'^logout/$', LogoutView.as_view(), name='logout'),

    # endpoints for server-side processing
    url(r'^download/(?P<slug>\w+)\.json$', export),
]

# for development
if settings.DEBUG:
    # https://docs.djangoproject.com/en/1.10/howto/static-files/#serving-files-uploaded-by-a-user-during-development
    urlpatterns += static(
        settings.MEDIA_URL, document_root=settings.MEDIA_ROOT,
    )

    # cypress testing
    urlpatterns += [url(r'^dev/(?P<action>\w+)/$', DevView.as_view())]
