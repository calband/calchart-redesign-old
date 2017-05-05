from django.views.generic.base import View, TemplateView
from django.http import Http404
from django.template.loader import get_template

from markdown import Markdown

from base.mixins import LoginRequiredMixin

extensions = [
    # add markdown extensions here
]
MARKDOWN = Markdown(extensions=extensions)

class BaseHelpView(LoginRequiredMixin, TemplateView):
    """
    The base class for all help pages. Help pages are arranged in a
    hierarchy, a subset of which will be shown as a table of contents.
    Any incoming page requests will be routed to the appropriate help
    page.

    The body of each page should go into a template located at
    `manual/<name_without_whitespaces>.md`.
    """
    template_name = 'manual/base.html'
    # the unique slug of this page
    slug = None
    # the unique name of this page. Defaults to the slug, capitalized.
    name = None
    # the slugs of help pages that are children of this page
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

    @classmethod
    def get_name(cls):
        if cls.name is None:
            if cls.slug is None:
                raise Exception('slug cannot be None')
            return cls.slug.replace('-', ' ').title()
        else:
            return cls.name

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
            return ChildView.as_view()(request, slug='/'.join(path[1:]))
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        template_name = self.name.replace(' ', '')
        template = get_template(f'manual/{template_name}.md')
        markdown = template.render({})
        context['help_body'] = MARKDOWN.convert(markdown)
        context['help_title'] = self.name

        # populate navigation bar
        navigation = []
        curr = self
        while curr is not None:
            navigation.append(curr)
            curr = PARENTS.get(curr.slug)

        context['navigation'] = reversed(navigation)

        return context

class RootHelp(BaseHelpView):
    """
    The root of the help pages.
    """
    slug = 'home'
    children = [
        'editing-dots',
    ]

class EditDotsHelp(BaseHelpView):
    slug = 'editing-dots'

# map slugs to the help view class
ALL_PAGES = {}
# map slugs to parent view class
PARENTS = {}
for obj in list(globals().values()):
    try:
        obj.name = obj.get_name()
        ALL_PAGES[obj.slug] = obj
        for child_slug in obj.children:
            PARENTS[child_slug] = obj
    except:
        pass

# convert children from slugs to view class
for page in ALL_PAGES.values():
    page.children = [
        ALL_PAGES[slug]
        for slug in page.children
    ]
