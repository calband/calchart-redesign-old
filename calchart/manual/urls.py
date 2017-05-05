from django.conf.urls import url

from manual.views import *

urlpatterns = [
    url(r'^$', RootHelp.as_view(), {'slug': ''}, name='index'),
    url(r'^(?P<slug>.*)/$', RootHelp.as_view(), name='detail'),
]
