from django.core.files.base import ContentFile
from django.db.migrations.operations.base import Operation

import json

from base.models import Show

class UpdateShowVersion(Operation):
    """
    Update Show viewer files from version X to version X + 1. See
    docs/Versioning.md for more details.
    """
    def __init__(self, version, update):
        self.version = version
        self.update = update

    def state_forwards(self, app_label, state):
        pass

    def database_forwards(self, app_label, schema_editor, from_state, to_state):
        for show in Show.objects.all():
            if not show.viewer_file:
                continue

            data = json.loads(show.viewer)

            if data['version'] < self.version:
                self.update(data)
                data['version'] = self.version

            show.viewer = json.dumps(data)
            show.save()

    def database_backwards(self, app_label, schema_editor, from_state, to_state):
        pass

    def describe(self):
        return f'Update to version {self.version}'
