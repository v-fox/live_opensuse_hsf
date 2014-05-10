#!/bin/bash

# detecting sensors for lm_sensors
yes | sudo sensors-detect

# self-destruction
#rm -f /usr/share/firstboot/scripts/HWB-firstboot

exit 0
