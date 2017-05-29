from django import forms
from django.conf import settings
from django.contrib.auth.forms import UserCreationForm
from django.forms import modelform_factory
from django.utils.text import camel_case_to_spaces

from base.constants import *
from base.fields import *
from base.models import Show, User

### FORMS ###

class CreateUserForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = User
        fields = (
            'username',
            'email',
            'password1',
            'password2',
        )

    email = forms.EmailField()

    def save(self):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.save()

        return user

### EDITOR POPUPS ###

class SetUpShowPopup(object):
    """
    The popup to set up a show when first opening in the editor view.
    """
    name = 'setup-show'
    template_name = 'partials/popup_no_cancel.html'
    title = 'Set Up Show'

    numDots = forms.IntegerField(label='Number of dots')
    dotFormat = forms.ChoiceField(choices=DOT_FORMATS, initial='combo')
    fieldType = forms.ChoiceField(choices=FIELD_TYPES, initial='college')

class EditShowPopup(object):
    """
    The popup to edit a show.
    """
    name = 'edit-show'
    title = 'Show Properties'

    fieldType = forms.ChoiceField(choices=FIELD_TYPES)
    beatsPerStep = forms.IntegerField()
    stepType = forms.ChoiceField(choices=STEP_TYPES)
    orientation = forms.ChoiceField(choices=ORIENTATIONS)

class AddSongPopup(object):
    """
    The popup to add a song
    """
    name = 'add-song'

    songName = forms.CharField(label='Name')

class EditSongPopup(object):
    """
    The popup to edit a song
    """
    name = 'edit-song'

    songName = forms.CharField(label='Name')
    fieldType = forms.ChoiceField(choices=DEF_FIELD_TYPES)
    beatsPerStep = BeatsPerStepField(label='Beats per step')
    stepType = forms.ChoiceField(choices=DEF_STEP_TYPES)
    orientation = forms.ChoiceField(choices=DEF_ORIENTATIONS)

class AddStuntsheetPopup(object):
    """
    The popup to add a stuntsheet
    """
    name = 'add-stuntsheet'

    numBeats = forms.IntegerField(label='Number of beats')

class EditStuntsheetPopup(object):
    """
    The popup to edit a stuntsheet
    """
    name = 'edit-stuntsheet'
    template_name = 'partials/popup_edit_sheet.html'

    label = forms.CharField(label='Label (opt.)', required=False)
    numBeats = forms.IntegerField(label='Number of beats')
    fieldType = forms.ChoiceField(choices=DEF_FIELD_TYPES)
    beatsPerStep = BeatsPerStepField(label='Beats per step')
    stepType = forms.ChoiceField(choices=DEF_STEP_TYPES)
    orientation = forms.ChoiceField(choices=DEF_ORIENTATIONS)

class EditContinuityPopup(object):
    """
    The popup to edit a continuity
    """
    name = 'edit-continuity'
    template_name = 'partials/popup_edit_continuity.html'

editor_popups = [
    SetUpShowPopup,
    EditShowPopup,
    AddSongPopup,
    EditSongPopup,
    AddStuntsheetPopup,
    EditStuntsheetPopup,
    EditContinuityPopup,
]
