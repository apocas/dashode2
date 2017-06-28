# -*- mode: ruby -*-
# vi: set ft=ruby :

BOX_NAME = ENV['BOX_NAME'] || "ubuntu/xenial64"
SSH_PRIVKEY_PATH = ENV["SSH_PRIVKEY_PATH"]

$script = <<SCRIPT
user="$1"
if [ -z "$user" ]; then
    user=vagrant
fi

apt-get update -q
apt-get install -q -y apt-transport-https ca-certificates

apt-get update -q

curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -

apt-get update -q
apt-get install -q -y nodejs python-software-properties python g++ make software-properties-common nginx

SCRIPT

Vagrant::Config.run do |config|
  config.vm.box = BOX_NAME

  if SSH_PRIVKEY_PATH
      config.ssh.private_key_path = SSH_PRIVKEY_PATH
  end

  config.ssh.forward_agent = true
end

Vagrant::VERSION >= "1.1.0" and Vagrant.configure("2") do |config|
  config.vm.network "forwarded_port", guest: 80, host: 8080
  config.vm.network "forwarded_port", guest: 8081, host: 8081
  config.vm.provider :virtualbox do |vb, override|
    override.vm.provision :shell, :inline => $script
    vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
    vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
  end
end
