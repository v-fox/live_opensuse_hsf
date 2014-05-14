#!/bin/sh
#======================================
# Functions...
#--------------------------------------
test -f /.kconfig && . /.kconfig
test -f /.profile && . /.profile

#======================================
# Greeting...
#--------------------------------------
echo "Configure image: [$kiwi_iname]..."

#==========================================
# setup build day
#------------------------------------------
baseSetupBuildDay

# isolinux graphical theme
gfxboot --update-theme HSF
#==========================================
# umount
#------------------------------------------
baseCleanMount

#======================================
# Exit safely
#--------------------------------------
exit 0
