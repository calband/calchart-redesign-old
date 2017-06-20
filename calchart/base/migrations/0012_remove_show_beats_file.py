# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import re


def update_viewer_file(forward):
    """Update the path to the viewer file."""
    def update_path(show):
        if not show.data_file:
            return

        if forward:
            show.data_file = re.sub(r'viewer/(.+)\.viewer', r'shows/\1.show', show.data_file.name)
        else:
            show.data_file = re.sub(r'shows/(.+)\.show', r'viewer/\1.viewer', show.data_file.name)

    def wrapped(apps, schema_editor):
        Show = apps.get_model('base', 'Show')
        for show in Show.objects.all():
            update_path(show)
            show.save()

    return wrapped


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0011_version_6'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='show',
            name='beats_file',
        ),
        migrations.RenameField(
            model_name='show',
            old_name='viewer_file',
            new_name='data_file',
        ),
        migrations.AlterField(
            model_name='show',
            name='data_file',
            field=models.FileField(upload_to=b'shows'),
        ),
        migrations.RunPython(
            update_viewer_file(True),
            update_viewer_file(False),
        )
    ]
