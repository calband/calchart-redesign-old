from django.contrib.auth.models import AbstractUser
from django.core.files.base import ContentFile
from django.db import models
from django.utils.text import slugify

class User(AbstractUser):
    """
    A user can either be a Calchart user (create an account specifically
    for Calchart) or imported from Members Only.

    If a Members Only User, no password is set (see Django's
    User.set_unusable_password) and an API token is used to communicate
    with Members Only.
    """
    api_token = models.CharField(max_length=40)
    api_token_expiry = models.DateTimeField()

    def is_members_only_user(self):
        return len(self.api_token) == 0

class Show(models.Model):
    """
    A Show contains all of the data for a show (saved as a JSON file), along
    with any metadata related to a show.
    """
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField()
    owner = models.CharField(max_length=255) # owner's username
    published = models.BooleanField(default=False)
    date_added = models.DateTimeField(auto_now_add=True)

    # the json file that dictates all the movements of a show
    viewer_file = models.FileField(upload_to='viewer')
    # the json file that dictates the number of milliseconds per beat
    beats_file = models.FileField(upload_to='beats')
    # the audio file to animate the show
    audio_file = models.FileField(upload_to='audio')

    def __unicode__(self):
        return self.name

    @property
    def viewer(self):
        if not hasattr(self, '_viewer'):
            if self.viewer_file:
                self._viewer = self.viewer_file.read()
            else:
                self._viewer = None

        return self._viewer

    @viewer.setter
    def viewer(self, viewer):
        # overwrite any existing viewer file
        self.viewer_file.delete()
        self.viewer_file.save(f'{self.slug}.viewer', ContentFile(viewer))
        self._viewer = viewer

    @property
    def beats(self):
        if not hasattr(self, '_beats'):
            if self.beats_file:
                self._beats = self.beats_file.read()
            else:
                self._beats = None
        return self._beats

    @beats.setter
    def beats(self, beats):
        # overwrite any existing beats file
        self.beats_file.delete()
        self.beats_file.save(f'{self.slug}.beats', ContentFile(beats))
        self._beats = beats

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
