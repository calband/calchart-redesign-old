from django import template
from django.core.urlresolvers import reverse

register = template.Library()

@register.simple_tag(name='page')
def get_page(slug):
    """
    Output the URL for the given help page slug.
    """
    return reverse('help:detail', kwargs={'slug': slug})

@register.simple_tag(takes_context=True)
def child_page(context, slug):
    """
    Output the URL for the child help page with the given slug
    """
    path = context['request'].path
    return f'{path}{slug}/'
