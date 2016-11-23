# This script allows users to easily run grunt commands in the virtual machine
# E.g. python vgrunt.py build will run `grunt build` in the virtual machine

import os
import sys

BASE_COMMAND = "vagrant ssh -c 'cd ..; %s'"

def print_and_run_system(cmd):
    print("[Exec] " + BASE_COMMAND % cmd)
    os.system(BASE_COMMAND % cmd)

if __name__ == '__main__':
    print_and_run_system("grunt " + " ".join(sys.argv[1:]))
