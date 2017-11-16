"""Actions for the editor application."""

from .utils import retrieve_show


def save_show(data, **kwargs):
    """Get the show with the given slug."""
    show_data = data['showData']

    show = retrieve_show(show_data['slug'], kwargs['user'])
    show.save_data(show_data)
