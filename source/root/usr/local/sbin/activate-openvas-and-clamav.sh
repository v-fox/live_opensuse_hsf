#!/bin/sh

# setup/update ClamAV
systemctl enable clamd
chown -R vscan:vscan /var/lib/clamav
systemctl start clamd
freshclam
# setup/update OpenVAS
#openvas-setup
openvas-mkcert -q
openvas-mkcert-client -n -i
openvas-nvt-sync
openvas-certdata-sync
openvas-scapdata-sync
openvasmd --rebuild
openvasmd --create-user=admin --role=Admin
openvasmd --user=admin --new-password=DeusExMachina
systemctl enable redis@openvas
systemctl enable openvas-scanner
systemctl enable openvas-manager
systemctl enable greenbone-security-assistant
systemctl start redis@openvas
systemctl start openvas-scanner
systemctl start openvas-manager
systemctl start greenbone-security-assistant
