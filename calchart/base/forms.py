from django import forms
from django.contrib.auth.forms import UserCreationForm

from base.models import User

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
