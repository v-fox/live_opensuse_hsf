#!/bin/bash

#======================================
# Functions...
#--------------------------------------
test -f /.kconfig && . /.kconfig
test -f /.profile && . /.profile

#======================================
# Greeting...
#--------------------------------------
echo "Configure image: [$name]..."

#======================================
# Mount system filesystems
#--------------------------------------
baseMount
#======================================

#======================================
# SuSEconfig
#--------------------------------------
echo "** Running suseConfig..."
suseConfig

echo "** Running ldconfig..."
/sbin/ldconfig

#======================================
# Setup default runlevel
#--------------------------------------
baseSetRunlevel 5

#======================================
# Add missing gpg keys to rpm
#--------------------------------------
suseImportBuildKey

#======================================
# CUSTOMIZATION
#--------------------------------------
suseActivateDefaultServices
systemctl disable rsyslog
systemctl disable apparmor
systemctl disable SuSEfirewall2
systemctl disable wicked.service
systemctl enable pm-profiler
systemctl enable rtkit-daemon
systemctl enable compcache
systemctl enable irq_balancer
systemctl enable upower
systemctl enable gpm
ln -s '/usr/lib/systemd/system/kmsconvt@.service' '/etc/systemd/system/autovt@.service'
systemctl enable autofs
systemctl enable lm_sensors
systemctl enable hddtemp
systemctl enable dkms
systemctl enable bluetooth
systemctl enable ModemManager
systemctl enable NetworkManager
systemctl enable ntp
systemctl enable dnscrypt-proxy
systemctl enable unbound
systemctl enable tor
systemctl enable polipo
systemctl enable avahi-daemon
systemctl enable miredo-client
systemctl enable colord
systemctl enable xdm

# preemptively generate unbound keys
systemctl restart unbound-keygen
# preemptively building our dkms kernel modules
/usr/sbin/dkms autoinstall
# preemptively setting up NIS domain name for legacy compatibility
netconfig update

# making list of installed packages from default user
OUR_USER="$(getent passwd "1000" | cut -d: -f1)"
NAME_PRETTY=$(echo "${kiwi_iname}" | sed 's:_: :g')
eval $(grep --color=no BUILD_ID /etc/os-release)
PACKAGE_LIST="/home/${OUR_USER}/${NAME_PRETTY} - package list - ${kiwi_iversion}_${BUILD_ID}.txt"
rpm -qa | sort -fu > "${PACKAGE_LIST}"
chown ${OUR_USER}:users "${PACKAGE_LIST}"

# updating gtk icon cache in hopes that it'll help with missing icons
find /usr/share/icons -mindepth 1 -maxdepth 1 -type d -exec gtk-update-icon-cache -q -t -f "{}" \;

# staying fresh even in deeper places
update-ca-certificates
update-pciids
update-usbids.sh
update-smart-drivedb

# making sure that en_US locale packages are present (otherwise programs like iBus are shitting themselves)
#yast2 language set lang=en_GB languages=en_US

#======================================
# Prune extraneous files
#--------------------------------------
# Remove all license files
find /usr/share/doc/packages -type f -iregex ".*copying*\|.*license*\|.*copyright*" -exec rm -fv "{}" \;

#======================================
# Keep UTF-8 locale and delete all translations
#--------------------------------------
#baseStripLocales \
#	$(for i in $(echo $kiwi_language | tr "," " ");do echo -n "$i.utf8 ";done)
#baseStripTranslations kiwi.mo

#======================================
# SSL Certificates Configuration
#--------------------------------------
echo '** Rehashing SSL Certificates...'
c_rehash

#======================================
# Creating mlocate database
#--------------------------------------
/etc/cron.daily/mlocate.cron

#======================================
# Creating manual database
#--------------------------------------
/etc/cron.daily/suse-do_mandb

#======================================
# Umount kernel filesystems
#--------------------------------------
baseCleanMount

#======================================
# Exit safely
#--------------------------------------
exit 0
