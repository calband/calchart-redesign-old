from __future__ import unicode_literals

from django import template
from django.utils.html import mark_safe

import json

register = template.Library()

@register.filter
def asjson(json_str):
    if json_str is None:
        json_str = 'null'
    elif not isinstance(json_str, basestring):
        json_str = json.dumps(json_str)

    return mark_safe(json_str)
