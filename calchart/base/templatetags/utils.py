from django import template
from django.template.defaultfilters import stringfilter
from django.utils.html import mark_safe

import json

from base.constants import DOT_TYPES

register = template.Library()

@register.filter
def asjson(json_str):
    if json_str is None:
        json_str = 'null'
    elif not isinstance(json_str, bytes):
        json_str = json.dumps(json_str)

    return json_str

@register.tag
def foreach_dottype(parser, token):
    """
    Outputs the contents for each dot type, adding `dot_type` to the context.

    from:
    {% foreach_dottype %}
        <li>{{ dot_type }}</li>
    {% endfor %}

    to:
    <li>plain</li>
    <li>solid</li>
    <li>plain-forwardslash</li>
    <li>solid-forwardslash</li>
    <li>plain-backslash</li>
    <li>solid-backslash</li>
    <li>plain-x</li>
    <li>solid-x</li>
    """
    nodelist = parser.parse(('endfor',))
    parser.delete_first_token()
    return ForEachDotTypeNode(nodelist)

class ForEachDotTypeNode(template.Node):
    def __init__(self, nodelist):
        self.nodelist = nodelist

    def render(self, context):
        contents = []
        for dot_type in DOT_TYPES:
            context['dot_type'] = dot_type
            contents.append(self.nodelist.render(context))

        return mark_safe(''.join(contents))
