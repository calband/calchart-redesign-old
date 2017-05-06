"""
Update pip requirements on the Virtualbox VM

Usage:
python scripts/update_requirements.py
"""

import os

command = 'pip3 install -r requirements/dev.txt'
os.system('vagrant ssh -c "cd /vagrant; sudo bash -c \'"\'%s\'"\'"' % command)
