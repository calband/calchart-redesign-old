#!/bin/bash

source bash_profile
python manage.py migrate --noinput
python manage.py shell < ../scripts/createsuperuser.py
