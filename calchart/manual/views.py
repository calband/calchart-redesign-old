from django.views.generic.base import View, TemplateView
from django.core.urlresolvers import reverse
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

    def get_markdown_context(self):
        return {
            'page': self,
        }

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        template_name = self.name.replace(' ', '')
        template = get_template(f'manual/{template_name}.md')
        markdown = template.render(self.get_markdown_context())
        context['help_body'] = MARKDOWN.convert(markdown)
        context['help_title'] = self.name

        # populate navigation bar
        context['navigation'] = PARENTS[self.slug]

        return context

    def get_url(self):
        """
        Get the URL for this page.
        """
        slug = '/'.join([
            parent.slug for parent in PARENTS[self.slug]
            if parent.slug != 'home'
        ])
        return reverse('help:detail', kwargs={'slug': slug})

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
    children = [
        'select-dots',
        'position-dots',
        'change-dot-types',
    ]

class SelectDotsHelp(BaseHelpView):
    slug = 'select-dots'

class PositionDotsHelp(BaseHelpView):
    slug = 'position-dots'

class ChangeDotTypesHelp(BaseHelpView):
    slug = 'change-dot-types'

# map slugs to the help view class
ALL_PAGES = {}
for obj in list(globals().values()):
    try:
        obj.name = obj.get_name()
        ALL_PAGES[obj.slug] = obj
    except:
        pass

# convert children from slugs to view class
for page in ALL_PAGES.values():
    page.children = [
        ALL_PAGES[slug]
        for slug in page.children
    ]

# map slugs to list of parents of the form [root, parent1, parent2, child]
PARENTS = {
    RootHelp.slug: [RootHelp],
}
todo = [RootHelp]
while len(todo) > 0:
    page = todo.pop(0)
    parents = PARENTS[page.slug]
    for child in page.children:
        PARENTS[child.slug] = parents + [child]
        todo.append(child)
