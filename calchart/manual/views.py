from django.views.generic.base import View, TemplateView
from django.http import Http404

class BaseHelpView(TemplateView):
    """
    The base class for all help pages. Help pages are arranged in a
    hierarchy, a subset of which will be shown as a table of contents.
    Any incoming page requests will be routed to the appropriate help
    page.

    The body of each page should go into a template located at
    `manual/<slug>.html`.
    """
    template_name = 'manual/base.html'
    # the unique slug for this page
    slug = None
    # help pages that are children of this page
    children = []

    @classmethod
    def get_child(cls, slug):
        """
        Get the child with the given slug
        """
        for ChildView in cls.children:
            if ChildView.slug == slug:
                return ChildView
        return None

    def dispatch(self, request, *args, **kwargs):
        """
        Route the request according to kwargs['slug']. If slug is the
        empty string, this is the correct page. Otherwise, route to
        the appropriate children.
        """
        slug = kwargs['slug']
        if slug != '':
            path = slug.split('/')
            child_slug = path[0]
            ChildView = self.get_child(child_slug)
            if ChildView is None:
                raise Http404
            return ChildView.as_view(request, slug='/'.join(path[1:]))
        return super().dispatch(request, *args, **kwargs)

class HelpView(BaseHelpView):
    """
    The root of the help pages.
    """
    slug = 'home'
