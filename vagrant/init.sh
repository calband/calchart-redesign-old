#!/usr/bin/env bash

# fail entire script if any operation fails
set -eo pipefail

# print a statement after a newline
newline_print() {
    echo " "
    echo $1
}

LOG_FILE=/home/vagrant/vagrant-install-ansible.log
if [ -f $LOG_FILE ]; then
    rm $LOG_FILE
fi
touch $LOG_FILE

# tries to run the given command, redirecting output to
# LOG_FILE and printing an error message on fail
# Usage: try apt-get -y install ansible
try() {
    ($* >> $LOG_FILE) || (echo "Command '$*' failed" && exit 1)
}

# install ansible if not already installed
if [ ! -x /usr/bin/ansible-playbook ]; then
    newline_print "Installing Ansible"

    try apt-get -y install software-properties-common
    try apt-add-repository ppa:ansible/ansible
    try apt-get update
    try apt-get -y install ansible
fi

newline_print "Running ansible playbook"
cd /vagrant/vagrant
# show ansible output: https://github.com/mitchellh/vagrant/issues/2194
export PYTHONUNBUFFERED=1
# run ansible on the local connection, using our own inventory
ansible-playbook playbook.yml --connection=local --inventory=ansible_hosts

## Install Heroku Toolbelt
wget -O- https://toolbelt.heroku.com/install-ubuntu.sh | sh
heroku plugins:install heroku-pipelines

## setting up bash_profile

newline_print "Setting up bash_profile"
cd /vagrant
cat vagrant/bash_profile | tr -d '\r' > /home/vagrant/.bash_profile # replace \r for Windows

## migrating django migrations here because Ansible cannot `source .bash_profile`
## necessary to use manage.py

newline_print "Migrating Django migrations"
cd /home/vagrant
source .bash_profile
try python manage.py migrate --noinput

newline_print "done."
