"""Forms for the base app."""

from django import forms
from django.contrib.auth.forms import UserCreationForm

from .models import User


class CreateUserForm(UserCreationForm):
    """A form for creating a Calchart User."""

    class Meta(UserCreationForm.Meta):
        """The form definition based on the User model."""

        model = User
        fields = (
            'username',
            'email',
            'password1',
            'password2',
        )

    email = forms.EmailField()

    def save(self):
        """Create the User defined by the form."""
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.save()

        return user
