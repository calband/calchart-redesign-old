from django import template

import json

register = template.Library()

@register.filter
def asjson(json_str):
    if json_str is None:
        json_str = 'null'
    elif not isinstance(json_str, bytes):
        json_str = json.dumps(json_str)

    return json_str
