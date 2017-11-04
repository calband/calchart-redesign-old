import os
import sys

BASE_COMMAND = "vagrant ssh -c '%s'"

def print_and_run_system(cmd):
    sys.stdout.write("[Exec] " + BASE_COMMAND % cmd + "\n")
    sys.stdout.flush()
    os.system(BASE_COMMAND % cmd)

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'runserver':
        if len(sys.argv) == 2:
            sys.argv.append('0.0.0.0:5000')
        else:
            sys.argv[2] = '0.0.0.0:' + sys.argv[2]
    print_and_run_system("python manage.py " + " ".join(sys.argv[1:]))
