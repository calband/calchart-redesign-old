from django.forms import ChoiceField, Select
from django.utils.html import format_html
from django.utils.text import camel_case_to_spaces, slugify

class SelectOrInt(Select):
    """
    A widget that renders a number input next to the select element.
    """
    def render(self, name, *args, **kwargs):
        output = super().render(name, *args, **kwargs)
        return format_html(
            '{}<input name="custom{}" type="number">',
            output,
            name[0].upper() + name[1:],
        )

class BeatsPerStepField(ChoiceField):
    """
    A form field for selecting either the default beats per step or typing
    a custom beats per step.
    """
    widget = SelectOrInt

    def __init__(self, *args, **kwargs):
        kwargs['choices'] = [
            ('default', 'Default'),
            ('custom', 'Custom'),
        ]
        super().__init__(*args, **kwargs)
