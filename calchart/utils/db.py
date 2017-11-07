"""Utilities for database operations."""

from django.db.migrations.operations.base import Operation


class UpdateShowVersion(Operation):
    """
    Update Show viewer files from version X to version X + 1.

    See docs/Versioning.md for more details.
    """

    def __init__(self, version, update):
        """Initialize the operation."""
        self.version = version
        self.update = update

    def state_forwards(self, app_label, state):
        """Modify the state when applying the migration."""
        pass

    def database_forwards(
        self, app_label, schema_editor, from_state, to_state,
    ):
        """Modify the database when applying the migration."""
        Show = from_state.apps.get_model('base.Show')
        for show in Show.objects.all():
            if not show.data_file:
                continue

            data = show.get_data()

            if data['version'] < self.version:
                self.update(data)
                data['version'] = self.version
                show.save_data(data)

    def database_backwards(
        self, app_label, schema_editor, from_state, to_state,
    ):
        """Modify the database when unapplying the migration."""
        pass

    def describe(self):
        """Describe the migration."""
        return f'Update to version {self.version}'
