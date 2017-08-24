from django.core.files.base import ContentFile
from django.db.migrations.operations.base import Operation

import json

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
        Show = from_state.apps.get_model('base.Show')
        for show in Show.objects.all():
            if not show.data_file:
                continue

            data = show.get_data()

            if data['version'] < self.version:
                self.update(data)
                data['version'] = self.version
                show.save_data(data)

    def database_backwards(self, app_label, schema_editor, from_state, to_state):
        pass

    def describe(self):
        return f'Update to version {self.version}'
