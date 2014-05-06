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
# RPM GPG Keys Configuration
#--------------------------------------
echo '** Importing GPG Keys...'
rpm --import /studio/studio_rpm_key_0
rm /studio/studio_rpm_key_0

#======================================
# Sysconfig Update
#--------------------------------------
echo '** Update sysconfig entries...'
baseUpdateSysConfig /etc/sysconfig/keyboard KEYTABLE english-us
baseUpdateSysConfig /etc/sysconfig/network/config FIREWALL yes
baseUpdateSysConfig /etc/init.d/suse_studio_firstboot NETWORKMANAGER yes
baseUpdateSysConfig /etc/sysconfig/SuSEfirewall2 FW_SERVICES_EXT_TCP 22\ 80\ 443
baseUpdateSysConfig /etc/sysconfig/console CONSOLE_FONT lat9w-16.psfu


#======================================
# CUSTOMIZATION
#--------------------------------------

baseSetupUserPermissions
suseActivateDefaultServices
suseRemoveService xdm
suseInsertService boot.compcache
suseInsertService irq_balancer
suseInsertService gpm
#ln -s '/usr/lib/systemd/system/bluetooth.service' '/etc/systemd/system/dbus-org.bluez.service'
#ln -s '/usr/lib/systemd/system/bluetooth.service' '/etc/systemd/system/bluetooth.target.wants/bluetooth.service'
#ln -s '/usr/lib/systemd/system/tor.service' '/etc/systemd/system/multi-user.target.wants/tor.service'
#ln -s '/usr/lib/systemd/system/polipo.service' '/etc/systemd/system/multi-user.target.wants/polipo.service'
# ln -s '/usr/lib/systemd/system/kmscon.service' '/etc/systemd/system/multi-user.target.wants/kmscon.service'
ln -s '/usr/lib/systemd/system/kmsconvt@.service' '/etc/systemd/system/autovt@.service'
#ln -s '/etc/systemd/system/lightdm.service' '/etc/systemd/system/displaymanager.service'
#ln -s '/etc/systemd/system/lightdm.service' '/etc/systemd/system/graphical.target.wants/lightdm.service'
#ln -s '/usr/lib/systemd/system/lm_sensors.service' '/etc/systemd/system/multi-user.target.wants/lm_sensors.service'
systemctl enable bluetooth
systemctl enable tor
systemctl enable polipo
systemctl enable lightdm
systemctl enable autofs
systemctl enable lm_sensors
systemctl enable dkms_autoinstaller
/usr/sbin/dkms autoinstall

#======================================
# Prune extraneous files
#--------------------------------------
# Remove all documentation
docfiles=`find /usr/share/doc/packages -type f |grep -iv "copying\|license\|copyright"`
rm -f "${docfiles}"
#rm -rf /usr/share/info
#rm -rf /usr/share/man

#======================================
# SSL Certificates Configuration
#--------------------------------------
echo '** Rehashing SSL Certificates...'
c_rehash

#======================================
# Umount kernel filesystems
#--------------------------------------
baseCleanMount

#======================================
# Exit safely
#--------------------------------------
exit 0
