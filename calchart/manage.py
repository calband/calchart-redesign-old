"""The entrypoint for all Django management commands."""

import os
import sys

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.dev')

    from django.core.management import execute_from_command_line

    if len(sys.argv) > 1:
        # by default, runserver runs on port 5000
        if sys.argv[1] == 'runserver' and len(sys.argv) == 2:
            sys.argv.append('5000')

    execute_from_command_line(sys.argv)
