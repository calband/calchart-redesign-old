"""Views for the wiki app."""

from base.mixins import LoginRequiredMixin

from django.http import Http404
from django.template.loader import get_template
from django.views.generic.base import TemplateView

from markdown import Markdown

from wiki.pages import ROOT_PAGE

extensions = [
    # add markdown extensions here
]
MARKDOWN = Markdown(extensions=extensions)


class HelpView(LoginRequiredMixin, TemplateView):
    """
    The class for all help pages.

    Help pages are defined in `wiki/pages.py`. The body of each
    page should go into a template located at `wiki/<slug>.md`.
    """

    template_name = 'wiki/base.html'

    def dispatch(self, request, *args, **kwargs):
        """
        Route the request according to kwargs['slug'].

        If slug is the empty string, display the home page. Otherwise,
        route to the appropriate page.
        """
        self.page = ROOT_PAGE

        if 'slug' in kwargs:
            path = kwargs['slug'].split('/')
            while len(path) > 0:
                slug = path.pop(0)
                self.page = self.page.get_child(slug)
                if self.page is None:
                    raise Http404

        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        """Get the context for the template."""
        context = super().get_context_data(**kwargs)

        wiki_template = get_template(f'wiki/{self.page.slug}.md')
        wiki_context = {
            'page': self.page,
        }
        wiki_body = wiki_template.render(wiki_context)

        context['wiki_body'] = MARKDOWN.convert(wiki_body)
        context['wiki_title'] = self.page.name

        context['navigation'] = self.page.get_parents()

        return context
