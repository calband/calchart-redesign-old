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

class BasePopupForm(object):
    """
    A popup form. A mixin to include with another Form class.
    """
    # the name of this popup -- needs to be unique to each popup
    name = None
    # classes to add to the popup div
    classes = []
    # template to load for the popup
    template_name = 'partials/popup.html'
    # title to show in the popup box, defaults to name
    title = None
    # description (as HTML) to show above the form in the popup box
    description = None
    # names for hidden fields
    hidden_fields = []
    # label for save button
    save_label = 'Save'

    def __init__(self, *args, **kwargs):
        super(BasePopupForm, self).__init__(*args, **kwargs)

        assert self.name is not None, 'Popup form needs a name'

        for field in self.hidden_fields:
            self.fields[field] = forms.CharField(widget=forms.HiddenInput)

        if self.title is None:
            # automatically generate from the name
            self.title = self.name.replace('-', ' ').title()

class PopupForm(BasePopupForm, forms.Form):
    """
    A form to use for any popups on the site. Can be included on a page using
    the CalchartMixin.
    """
    pass

### EDITOR POPUPS ###

class SetUpShowPopup(PopupForm):
    """
    The popup to set up a show when first opening in the editor view.
    """
    name = 'setup-show'
    template_name = 'partials/setup_show.html'
    title = 'Set Up Show'

    DOT_FORMATS = [
        ('combo', 'A0, A1, A2, ...'),
        ('number', '1, 2, 3, ...'),
    ]

    num_dots = forms.IntegerField(label='Number of dots')
    dot_format = forms.ChoiceField(choices=DOT_FORMATS)
