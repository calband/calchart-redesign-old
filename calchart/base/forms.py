from django import forms
from django.forms import modelform_factory
from django.conf import settings
from django.utils.text import camel_case_to_spaces

import requests

from base.constants import *
from base.fields import *
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

        # manually set labels for each field, since we're using camelcase
        for field_name, field in self.fields.items():
            if field.label is None:
                field.label = camel_case_to_spaces(field_name).capitalize()

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
    template_name = 'partials/popup_setup_show.html'
    title = 'Set Up Show'

    numDots = forms.IntegerField(label='Number of dots')
    dotFormat = forms.ChoiceField(choices=DOT_FORMATS, initial='combo')
    fieldType = forms.ChoiceField(choices=FIELD_TYPES, initial='college')

class EditShowPopup(PopupForm):
    """
    The popup to edit a show.
    """
    name = 'edit-show'
    title = 'Show Properties'

    fieldType = forms.ChoiceField(choices=FIELD_TYPES)
    beatsPerStep = forms.IntegerField()
    stepType = forms.ChoiceField(choices=STEP_TYPES)
    orientation = forms.ChoiceField(choices=ORIENTATIONS)

class AddStuntsheetPopup(PopupForm):
    """
    The popup to add a stuntsheet
    """
    name = 'add-stuntsheet'

    numBeats = forms.IntegerField(label='Number of beats')

class EditStuntsheetPopup(PopupForm):
    """
    The popup to edit a stuntsheet
    """
    name = 'edit-stuntsheet'

    label = forms.CharField()
    numBeats = forms.IntegerField(label='Number of beats')
    fieldType = forms.ChoiceField(choices=DEF_FIELD_TYPES)
    beatsPerStep = BeatsPerStepField(label='Beats per step')
    stepType = forms.ChoiceField(choices=DEF_STEP_TYPES)
    orientation = forms.ChoiceField(choices=DEF_ORIENTATIONS)

class EditContinuityPopup(PopupForm):
    """
    The popup to edit a continuity
    """
    name = 'edit-continuity'
    template_name = 'partials/popup_edit_continuity.html'

editor_popups = [
    SetUpShowPopup,
    EditShowPopup,
    AddStuntsheetPopup,
    EditStuntsheetPopup,
    EditContinuityPopup,
]
