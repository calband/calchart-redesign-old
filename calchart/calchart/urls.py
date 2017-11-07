from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib.auth.views import LogoutView

from base.views import (
    CalchartView,
    LoginView,
    AuthMembersOnlyView,
    CreateUserView,
    export,
)

urlpatterns = [
    url(r'^$', CalchartView.as_view(), name='home'),
    url(r'^editor/.+/$', CalchartView.as_view()),
    url(r'^viewer/.+/$', CalchartView.as_view()),
    url(r'^viewpsheet/.+/$', CalchartView.as_view()),
    url(r'^help/', include('wiki.urls', namespace='wiki')),

    # authentication
    url(r'^login/$', LoginView.as_view(), name='login'),
    url(
        r'^auth/members-only/$',
        AuthMembersOnlyView.as_view(),
        name='login-members-only',
    ),
    url(r'^create-user/$', CreateUserView.as_view(), name='create-user'),
    url(r'^logout/$', LogoutView.as_view(), name='logout'),

    # endpoints for server-side processing
    url(r'^download/(?P<slug>\w+)\.json$', export),
]

# for development
# https://docs.djangoproject.com/en/1.10/howto/static-files/#serving-files-uploaded-by-a-user-during-development
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )
