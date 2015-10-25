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
# we don't want it to run by default and its modules are broken anyway... or do we ?
#systemctl disable zfs
systemctl enable tuned
systemctl enable rtkit-daemon
systemctl enable compcache
systemctl enable irq_balancer
systemctl enable upower
systemctl enable gpm
ln -s '/usr/lib/systemd/system/kmsconvt@.service' '/etc/systemd/system/autovt@.service'
# greatly slows down boot up
#systemctl enable autofs
# $(sensors-detect) should be launched first manually to make sure that it's safe
#systemctl enable lm_sensors
systemctl enable hddtemp
systemctl enable dkms
systemctl enable bluetooth
systemctl enable ModemManager
systemctl enable NetworkManager
systemctl enable ntp
systemctl enable dnscrypt-proxy
systemctl enable unbound
systemctl enable tor
systemctl enable privoxy
systemctl enable avahi-daemon
# linphone provides P2P SIP, so we don't need SIP Witch
#systemctl enable sipwitch
systemctl enable miredo-client
systemctl enable colord
systemctl enable xdm
# needed for it to be properly run in VM
systemctl enable spice-vdagentd
# needed for it to run VMs
systemctl enable libvirtd

# systemd locale defaults
localectl list-x11-keymap-models "evdev"
localectl list-x11-keymap-options "grp:ctrl_shift_toggle,grp_led:scroll,compose:ralt,terminate:ctrl_alt_bksp"

# preemptively generate unbound keys
systemctl start unbound-keygen
# preemptively building our dkms kernel modules
#dkms autoinstall
# preemptively setting up NIS domain name for legacy compatibility
netconfig update

# updating gtk icon cache in hopes that it'll help with missing icons
find /usr/share/icons -mindepth 1 -maxdepth 1 -type d -exec gtk-update-icon-cache -q -t -f "{}" \;

# making sure that proxy is not used
for i in {http,https,ftp,no}_proxy {HTTP,HTTPS,FTP,NO}_PROXY; do
        unset "${i}"
done
alias wget="wget --no-proxy"

# staying fresh even in deeper places
update-ca-certificates
update-pciids
update-usbids.sh
update-smart-drivedb

# force-installing Google-fonts from crapload of packages here instead of the proper place
zypper --non-interactive --gpg-auto-import-keys refresh
zypper --non-interactive install "google-*-fonts"
# and installing all forensic tools while we're at it
zypper --non-interactive install --from security_forensics "*-tools"
# and YaST translations
zypper --non-interactive install "yast2-trans-*"
rm -rf /var/{cache,log}/zypp/*

# making list of installed packages from default user
OUR_USER="$(getent passwd "1000" | cut -d: -f1)"
NAME_PRETTY=$(echo "${kiwi_iname}" | sed 's:_: :g')
eval $(grep --color=no BUILD_ID /etc/os-release)
PACKAGE_LIST="/home/${OUR_USER}/${NAME_PRETTY} - package list - ${kiwi_iversion}_${BUILD_ID}.txt"
rpm -qa | sort -fu > "${PACKAGE_LIST}"
chown ${OUR_USER}:users "${PACKAGE_LIST}"

#======================================
# Prune extraneous files
#--------------------------------------
# Remove all license files
find /usr/share/doc/packages -type f -iregex ".*copying*\|.*license*\|.*copyright*" -exec rm -fv "{}" \;
# Remove all documentation
#rm -rf /usr/share/doc/*

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
umount -f -l /sys/kernel/security
baseCleanMount

#======================================
# Exit safely
#--------------------------------------
exit 0
