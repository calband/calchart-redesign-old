"""Custom template tags that provide utility functionality."""

import json

from django import template

register = template.Library()


@register.filter
def asjson(json_str):
    """Convert the given JSON object into a string."""
    if json_str is None:
        json_str = 'null'
    elif not isinstance(json_str, (bytes, str)):
        json_str = json.dumps(json_str)

    return json_str
