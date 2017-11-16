"""Actions for the home page."""

from django.utils import timezone

from ..models import Show
from .utils import retrieve_show


def get_tab(data, **kwargs):
    """Get the shows in the given tab."""
    user = kwargs['user']
    tab = data['tab']

    if tab == 'band':
        if not user.is_members_only_user():
            raise PermissionDenied
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


def create_show(data, **kwargs):
    """Create a show with the given name."""
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

    return {
        'slug': show.slug,
    }


def publish_show(data, **kwargs):
    """Publish or unpublish a show."""
    published = data['publish']
    show = retrieve_show(data['slug'], kwargs['user'])

    if not show.data_file:
        # Should only apply to publishing, since a show without data
        # cannot be published in the first place to be "unpublished"
        raise Exception('Cannot publish show before setting it up')

    show_data = show.get_data()
    show_data['published'] = published
    show.save_data(show_data)
