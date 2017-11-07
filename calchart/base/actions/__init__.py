# flake8: noqa
"""
This package organizes actions that can be sent from sendAction
on each page. Each action needs to have the following declaration:

def action_name(data, **kwargs):
    # action

`data` will contain the values from `request.POST`.

`kwargs` will contain the `request` object and the `user` making
the request.
"""

from .home import (
    create_show,
    publish_show,
)
