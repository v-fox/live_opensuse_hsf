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
# Firewall Configuration
#--------------------------------------
echo '** Configuring firewall...'
chkconfig SuSEfirewall2_init on
chkconfig SuSEfirewall2_setup on

#======================================
# Sysconfig Update
#--------------------------------------
echo '** Update sysconfig entries...'
#baseUpdateSysConfig /etc/sysconfig/keyboard KEYTABLE us
baseUpdateSysConfig /etc/sysconfig/network/config FIREWALL yes
baseUpdateSysConfig /etc/sysconfig/SuSEfirewall2 FW_SERVICES_EXT_TCP \21\ 22\ 80\ 443
#baseUpdateSysConfig /etc/sysconfig/console CONSOLE_FONT ter-u16n.psfu

#======================================
# CUSTOMIZATION
#--------------------------------------
baseSetupUserPermissions
suseActivateDefaultServices
systemctl disable xdm
systemctl enable apparmor
systemctl enable rtkit-daemon
systemctl enable compcache
systemctl enable irq_balancer
systemctl enable upower
systemctl enable gpm
ln -s '/usr/lib/systemd/system/kmsconvt@.service' '/etc/systemd/system/autovt@.service'
systemctl enable autofs
systemctl enable lm_sensors
systemctl enable hddtemp
systemctl enable dkms_autoinstaller
systemctl enable bluetooth
systemctl enable dnsmasq
systemctl enable ModemManager
systemctl enable NetworkManager
systemctl enable ntp
systemctl enable tor
systemctl enable polipo
systemctl enable avahi-daemon
systemctl enable miredo-client
systemctl enable colord
systemctl enable lightdm

# preemptively building our dkms kernel modules
/usr/sbin/dkms autoinstall

# making list of installed packages from default user
OUR_USER="$(getent passwd "1000" | cut -d: -f1)"
NAME_PRETTY=$(echo "${kiwi_iname}" | sed 's:_: :g')
PACKAGE_LIST="/home/${OUR_USER}/${NAME_PRETTY} - package list - ${VERSION_CONFIG}.txt"
rpm -qa | sort -fu > "${PACKAGE_LIST}"
chown ${OUR_USER}:users "${PACKAGE_LIST}"

# adding group 'plugdev' to accomodate broken udev rules
groupadd -f -g 100 -o plugdev

# updating gtk icon cache in hopes that it'll help with missing icons
find /usr/share/icons -mindepth 1 -maxdepth 1 -type d -exec gtk-update-icon-cache -q -t -f "{}" \;

#======================================
# Prune extraneous files
#--------------------------------------
# Remove all license files
find /usr/share/doc/packages -type f -iregex ".*copying*\|.*license*\|.*copyright*" -exec rm -fv "{}" \;

#======================================
# Keep UTF-8 locale and delete all translations
#--------------------------------------
baseStripLocales \
	$(for i in $(echo $kiwi_language | tr "," " ");do echo -n "$i.utf8 ";done)
baseStripTranslations kiwi.mo

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
# Umount kernel filesystems
#--------------------------------------
baseCleanMount

#======================================
# Exit safely
#--------------------------------------
exit 0
