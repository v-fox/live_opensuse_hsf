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
baseUpdateSysConfig /etc/sysconfig/SuSEfirewall2 FW_SERVICES_EXT_TCP \21 22\ 80\ 443
baseUpdateSysConfig /etc/sysconfig/console CONSOLE_FONT ter-u16n.psfu

#======================================
# CUSTOMIZATION
#--------------------------------------
suseGFXBoot openSUSE isolinux
baseSetupUserPermissions
suseActivateDefaultServices
suseRemoveService xdm
suseInsertService boot.compcache
suseInsertService irq_balancer
suseInsertService gpm
ln -s '/usr/lib/systemd/system/kmsconvt@.service' '/etc/systemd/system/autovt@.service'
systemctl enable bluetooth
systemctl enable dnsmasq
systemctl enable tor
systemctl enable polipo
systemctl enable lightdm
systemctl enable autofs
systemctl enable acpid
systemctl enable lm_sensors
systemctl enable dkms_autoinstaller
/usr/sbin/dkms autoinstall
systemctl enable NetworkManager
systemctl enable YaST2-Firstboot
systemctl enable HWB-firstboot

#======================================
# Prune extraneous files
#--------------------------------------
# Remove all documentation
docfiles=`find /usr/share/doc/packages -type f |grep -iv "copying\|license\|copyright"`
rm -f "${docfiles}"
#rm -rf /usr/share/info
#rm -rf /usr/share/man

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
# Umount kernel filesystems
#--------------------------------------
baseCleanMount

#======================================
# Exit safely
#--------------------------------------
exit 0
