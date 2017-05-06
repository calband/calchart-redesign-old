from django.core.urlresolvers import reverse

class HelpPage(object):
    """
    A helper class to organize pages in a hierarchy. Each help page
    needs a slug, a human-readable name, and help pages that are
    children of this page (i.e. underneath this page in the page
    hierarchy).

    By default, the name is the slug, replacing hyphens with spaces and
    capitalizing the first letter of each word.
    """
    def __init__(self, *args):
        self.slug = args[0]
        assert isinstance(self.slug, str)

        if len(args) > 1 and isinstance(args[1], str):
            self.name = args[1]
            self.children = args[2:]
        else:
            self.name = self.slug.replace('-', ' ').title()
            self.children = args[1:]

        self.parent = None
        for child in self.children:
            child.parent = self

    def get_parents(self):
        """
        Get a list of parents of the form [root, parent1, parent2, self]
        """
        curr = self
        parents = []
        while curr is not None:
            parents.append(curr)
            curr = curr.parent
        return reversed(parents)

    def get_child(self, slug):
        """
        Get the child with the given slug, or None if no child has the slug.
        """
        for child in self.children:
            if child.slug == slug:
                return child
        return None

    def get_url(self):
        """
        Get the URL for this page
        """
        slug = '/'.join([
            parent.slug
            for parent in self.get_parents()
            if parent.slug != 'home'
        ])
        return reverse('wiki:page', kwargs={'slug': slug})

ROOT_PAGE = HelpPage('home',
    HelpPage('setup-show'),
    HelpPage('setup-sheet', 'Setup Stuntsheets'),
    HelpPage('editing-dots',
        HelpPage('select-dots'),
        HelpPage('position-dots'),
        HelpPage('change-dot-types'),
    ),
    HelpPage('editing-continuities',
        HelpPage('fountain-grid', 'EWNS/NSEW'),
        HelpPage('forward-march'),
        HelpPage('mark-time'),
        HelpPage('close'),
        HelpPage('even-step'),
        HelpPage('diagonal', 'DMHS/HSDM'),
        HelpPage('follow-the-leader'),
        HelpPage('counter-march'),
        HelpPage('two-step'),
        HelpPage('gate-turn'),
        HelpPage('grapevine'),
    ),
)
