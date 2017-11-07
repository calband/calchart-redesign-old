#!/usr/bin/env python
"""The entrypoint for all Django management commands."""

import os
import sys

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "calchart.settings")

    from django.core.management import execute_from_command_line

    # by default, runserver runs on port 5000. Also requires running on
    # 0.0.0.0 since localhost is not exposed from the VM
    if len(sys.argv) == 2 and sys.argv[1] == 'runserver':
        sys.argv.append('0.0.0.0:5000')

    execute_from_command_line(sys.argv)
