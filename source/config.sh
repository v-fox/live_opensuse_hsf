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
#suseActivateDefaultServices
baseRemoveService rsyslog
baseRemoveService apparmor
baseRemoveService SuSEfirewall2
# get rid of systemd's NM knock-off... with extreme prejudice
baseRemoveService wicked.service
systemctl mask wicked
systemctl mask wickedd
baseInsertService NetworkManager
# we don't want it to run by default and its modules are broken anyway... or do we ?
baseRemoveService zfs
baseRemoveService zfs-mount
baseRemoveService zfs-share
baseRemoveService zfs-import-scan
baseRemoveService zfs-import-cache
# for some unfathomable reason these BTRFS crutches are not enabled by default
baseInsertService btrfsmaintenance-refresh
baseInsertService tuned
baseInsertService rtkit-daemon
baseInsertService compcache
baseInsertService irq_balancer
baseInsertService upower
baseInsertService gpm
ln -s '/usr/lib/systemd/system/kmsconvt@.service' '/etc/systemd/system/autovt@.service'
# greatly slows down boot up
#baseInsertService autofs
# $(sensors-detect) should be launched first manually to make sure that it's safe
#baseInsertService lm_sensors
baseInsertService hddtemp
baseInsertService dkms
baseInsertService bluetooth
baseInsertService ModemManager
baseInsertService ntp
baseInsertService dnscrypt-proxy
baseInsertService unbound
baseInsertService tor
baseInsertService privoxy
baseInsertService avahi-daemon
# linphone provides P2P SIP, so we don't need SIP Witch
#baseInsertService sipwitch
baseInsertService miredo-client
baseInsertService colord
baseInsertService xdm
# needed for it to be properly run in VM
baseInsertService spice-vdagentd
# needed for it to run VMs
baseInsertService libvirtd
# avoiding debugfs in favour of tracefs (https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=681418)
systemctl mask sys-kernel-debug.mount

# systemd locale defaults
localectl list-x11-keymap-models "evdev"
localectl list-x11-keymap-options "grp:ctrl_shift_toggle,grp_led:scroll,compose:ralt,terminate:ctrl_alt_bksp"

# making use of pam_schroedinger
pam-config -a --unix-nodelay

# preemptively building our dkms kernel modules
#dkms autoinstall
# preemptively setting up NIS domain name for legacy compatibility
netconfig update

# updating gtk icon cache in hopes that it'll help with missing icons
find /usr/share/icons -mindepth 1 -maxdepth 1 -type d -exec gtk-update-icon-cache -f "{}" \;

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
zypper --non-interactive install "google-*-fonts" || exit 1
# and installing all forensic tools while we're at it
zypper --non-interactive install --from security_forensics "*-tools" || exit 1
# and YaST translations
zypper --non-interactive install "yast2-trans-*" || exit 1
# removing unwanted packages (but why we would even have them in the first place ?)
suseRemovePackagesMarkedForDeletion
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
# Keep UTF-8 locale and
# delete all translations
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
# Preventing systemd from
# holding off boot up
# https://github.com/manjaro/release-plan/issues/17
#--------------------------------------
echo 'This is systemd anti-dumbassery hack. See systemd-update-done.service(8).' \
	| tee /etc/.updated > /var/.updated

#======================================
# Umount kernel filesystems
#--------------------------------------
umount -f -l /sys/kernel/security
baseCleanMount

#======================================
# Exit safely
#--------------------------------------
exit 0
