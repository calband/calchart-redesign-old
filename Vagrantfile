# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
    # Base box to build off, and download URL for when it doesn't exist on the user's system already
    config.vm.box = "ubuntu/trusty32"
    config.vm.box_url = "https://cloud-images.ubuntu.com/vagrant/trusty/current/trusty-server-cloudimg-i386-vagrant-disk1.box"
    
    # Forward a port from the guest to the host, which allows us to access the ports
    # exposed by the VM from our local machine.
    config.vm.network :forwarded_port, guest: 8000, host: 8000
    
    # sync the current directory with the /vagrant directory on the virtual machine
    config.vm.synced_folder ".", "/vagrant", :mount_options => ["fmode=666"]
    
    # provision with a script, which will install and run ansible
    config.vm.provision :shell, :path => "vagrant/init.sh"
end
