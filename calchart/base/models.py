"""Models for the base app."""

import json
from datetime import timedelta

from django.contrib.auth import models as auth_models
from django.core.files.base import ContentFile
from django.db import models
from django.utils import timezone
from django.utils.text import slugify

from utils.api import call_endpoint


class UserManager(auth_models.UserManager):
    """A subclass of the default UserManager."""

    def create_members_only_user(self, username, api_token, ttl_days):
        """
        Create a Members Only user.

        Since the User uses the same username as on Members Only, makes
        sure to make the username unique from Calchart usernames.
        """
        calchart_username = username
        while User.objects.filter(username=calchart_username).exists():
            calchart_username += '_'

        user = User.objects.create(
            username=calchart_username,
            members_only_username=username,
            api_token=api_token,
        )
        user.set_expiry(ttl_days)
        user.save()
        return user


class User(auth_models.AbstractUser):
    """
    A user can either be a Calchart user or a Members Only user.

    A Calchart user is an account specifically created for Calchart, while
    a Members Only user is imported from Members Only.

    If a Members Only User, no password is set (see Django's
    User.set_unusable_password) and an API token is used to communicate
    with Members Only.
    """

    objects = UserManager()

    members_only_username = models.CharField(max_length=150, null=True)
    api_token = models.CharField(max_length=40)
    api_token_expiry = models.DateTimeField(null=True)

    # preferences
    viewpsheet_settings = models.TextField(default='{}')

    def get_username(self):
        """Get this User's username."""
        if self.is_superuser or not self.is_members_only_user():
            return self.username
        else:
            return self.members_only_username

    def set_expiry(self, ttl_days):
        """Set a Members Only user's expiry to ttl_days from now."""
        if not self.is_members_only_user():
            return
        self.api_token_expiry = timezone.now() + timedelta(days=ttl_days)

    def is_members_only_user(self):
        """
        Return True if this User is a Members Only user.

        For the purposes of development, a superuser is a Members Only user.
        """
        return self.is_superuser or len(self.api_token) > 0

    def is_valid_api_token(self):
        """
        Return True if this User has a valid API token.

        Also returns True if this user is not a Members Only user.
        """
        return (
            self.is_superuser or
            not self.is_members_only_user() or
            timezone.now() + timedelta(days=1) < self.api_token_expiry
        )

    def has_committee(self, committee):
        """
        Check if this user is part of the given committee.

        See the Members Only API endpoint.
        """
        if self.is_superuser:
            return True

        if not self.is_members_only_user():
            return False

        response = call_endpoint('check-committee', self, committee=committee)
        return response['has_committee']


class Show(models.Model):
    """
    The model containing all of the data and metadata for a Calchart Show.

    The data is saved as a JSON file along with media files.
    """

    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField()
    owner = models.ForeignKey(User)
    published = models.BooleanField(default=False)
    date_added = models.DateTimeField(auto_now_add=True)
    is_band = models.BooleanField(default=False)

    # the json file that contains the serialized Javascript Show
    data_file = models.FileField(upload_to='shows')

    def __str__(self):
        """Get the string representation of a Show."""
        return self.name

    def get_data(self):
        """Get the Show as a JSON object."""
        return json.loads(self.data_file.read())

    def save_data(self, data):
        """Save the given JSON object as the Show data."""
        if isinstance(data, str):
            data_str = data
            data = json.loads(data)
        else:
            data_str = json.dumps(data)

        # update model according to data file
        self.slug = data['slug']
        self.name = data['name']
        self.is_band = data['isBand']
        self.published = data['published']

        # overwrite any existing data file
        self.data_file.delete()
        self.data_file.save(f'{self.slug}.show', ContentFile(data_str))

        self.save()

    def save(self, *args, **kwargs):
        """If a slug is not set, generate a unique slug before saving."""
        if not self.slug:
            slug = slugify(self.name)
            i = 0
            self.slug = slug
            while Show.objects.filter(slug=self.slug).exists():
                i += 1
                self.slug = f'{slug}-{i}'

        return super().save(*args, **kwargs)
