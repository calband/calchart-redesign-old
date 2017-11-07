from django.conf.urls import url

from wiki.views import HelpView

urlpatterns = [
    url(r'^$', HelpView.as_view(), name='home'),
    url(r'^(?P<slug>.*)/$', HelpView.as_view(), name='page'),
]
