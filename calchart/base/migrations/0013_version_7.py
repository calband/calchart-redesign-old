# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations
from utils.db import UpdateShowVersion

def update_version(show):
    show['beats'] = []

class Migration(migrations.Migration):

    dependencies = [
        ('base', '0012_remove_show_beats_file'),
    ]

    operations = [
        UpdateShowVersion(7, update_version),
    ]
