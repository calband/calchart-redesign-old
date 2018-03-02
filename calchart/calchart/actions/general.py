"""General actions for the application."""

from .utils import retrieve_show


def get_show(data, **kwargs):
    """Get the show with the given slug."""
    show = retrieve_show(data['slug'], kwargs['user'])

    if show.data_file:
        return {
            'isInitialized': True,
            'show': show.get_data(),
        }
    else:
        return {
            'isInitialized': False,
            'name': show.name,
            'slug': show.slug,
            'isBand': show.is_band,
        }
