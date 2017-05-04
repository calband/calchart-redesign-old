from django.conf.urls import url

from manual.views import *

urlpatterns = [
    url(r'^(?P<slug>.*)/$', HelpView.as_view(), name='index'),
]
