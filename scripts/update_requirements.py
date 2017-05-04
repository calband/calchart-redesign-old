"""
Update pip requirements on the Virtualbox VM
"""

import os

command = 'pip3 install -r requirements/dev.txt'
os.system('vagrant ssh -c "cd /vagrant; sudo bash -c \'"\'%s\'"\'"' % command)
