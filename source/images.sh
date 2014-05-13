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
suseGFXBoot HSF isolinux

#==========================================
# umount
#------------------------------------------
baseCleanMount

#======================================
# Exit safely
#--------------------------------------
exit 0
