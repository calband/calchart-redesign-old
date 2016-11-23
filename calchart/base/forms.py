from django import forms
from django.forms import modelform_factory
from django.conf import settings

import requests

from base.models import Show

class LoginForm(forms.Form):
    username = forms.CharField(max_length=255, required=False)
    password = forms.CharField(widget=forms.PasswordInput, required=False)

    LOGIN_URL = 'https://membersonly-prod.herokuapp.com/api/login/'

    def clean(self):
        # only authenticate on real server
        if settings.IS_HEROKU:
            r = requests.post(self.LOGIN_URL, data=self.cleaned_data)
            data = r.json()
            if not data['valid']:
                raise forms.ValidationError('Invalid username or password', code='invalid_login')

        return self.cleaned_data

def validate_show_name(name):
    """
    Validates the given value for a Show name. Raises a ValidationError if
    the given value does not pass validation.
    """
    ValidateForm = modelform_factory(
        Show,
        fields=['name'],
        error_messages={
            'name': {'required': 'Please provide the name of the show'},
        }
    )
    errors = ValidateForm(data={'name': name}).errors.get('name')
    if errors is not None:
        raise forms.ValidationError(errors)
