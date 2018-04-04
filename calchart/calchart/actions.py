"""
All actions that can be sent from sendAction.

Each action needs to have the following declaration:

def action_name(data, **kwargs):
    # action

`data` will contain the values from `request.POST`.

`kwargs` will contain the `request` object and the `user` making
the request.
"""

from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Show

""" Home page """


def get_tab(data, **kwargs):
    """Get the shows in the given tab."""
    user = kwargs['user']
    tab = data['tab']

    if tab == 'band':
        kwargs = {
            'is_band': True,
            'date_added__year': timezone.now().year,
        }
        if not user.has_committee('STUNT'):
            kwargs['published'] = True

        shows = Show.objects.filter(**kwargs)
    elif tab == 'owned':
        shows = Show.objects.filter(owner=user, is_band=False)
    else:
        raise ValueError(f'Invalid tab: {tab}')

    return {
        'shows': [
            {
                'slug': show.slug,
                'name': show.name,
                'published': show.published,
            }
            for show in shows
        ],
    }


""" Show actions """


def _retrieve_show(slug, user):
    """
    Helper to retrieve the Show with the given slug.

    Checks if the user has adequate permissions to view the show.
    """
    show = get_object_or_404(Show, slug=slug)
    if (show.is_band and not user.has_committee('STUNT')):
        raise PermissionDenied
    else:
        return show


def get_show(data, **kwargs):
    """Get the show with the given slug."""
    show = _retrieve_show(data['slug'], kwargs['user'])
    return show.get_data()


def create_show(data, **kwargs):
    """Create a show with the given data."""
    user = kwargs['user']
    name = data['name']
    is_band = data['isBand'] and user.has_committee('STUNT')

    if Show.objects.filter(name=name).exists():
        raise Exception(f'Show with the name `{name}` already exists.')

    kwargs = {
        'name': name,
        'owner': user,
        'is_band': is_band,
    }
    show = Show.objects.create(**kwargs)
    data['slug'] = show.slug
    data['published'] = False
    show.save_data(data)

    return {
        'slug': show.slug,
    }


def publish_show(data, **kwargs):
    """Publish or unpublish a show."""
    # TODO: check if stunt
    published = data['publish']
    show = retrieve_show(data['slug'], kwargs['user'])

    show_data = show.get_data()
    show_data['published'] = published
    show.save_data(show_data)


def save_show(data, **kwargs):
    """Get the show with the given slug."""
    show = _retrieve_show(data['slug'], kwargs['user'])
    show.save_data(data)
