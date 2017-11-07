"""Actions for the home page."""

from ..models import Show


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
    slug = data['slug']

    show = Show.objects.get(slug=slug)
    if not show.data_file:
        # Should only apply to publishing, since a show without data
        # cannot be published in the first place to be "unpublished"
        raise Exception('Cannot publish show before setting it up')

    show_data = show.get_data()
    show_data['published'] = published
    show.save_data(show_data)
