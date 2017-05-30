from django import forms
from django.conf import settings
from django.contrib.auth.forms import UserCreationForm
from django.forms import modelform_factory
from django.utils.text import camel_case_to_spaces

from base.constants import *
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

class EditContinuityPopup(object):
    """
    The popup to edit a continuity
    """
    name = 'edit-continuity'
    template_name = 'partials/popup_edit_continuity.html'
