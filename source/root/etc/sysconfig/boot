## Path:	System/Boot
## Description:	Controlling of the boot process
## Type:	yesno
## Default:	no
## Config:
#
# For interactive debugging of the startup process. If set
# to "yes" the system will ask whether to confirm every
# step of the boot process. This will however only work
# if the keyboard is already accessable at this time,
# eg. USB keyboards need their modules loaded first.
#
PROMPT_FOR_CONFIRM="no"

## Type:	integer
## Default:	5
#
# For interactive debugging of the startup process. How long
# wait before the default answer is assumed.
#
CONFIRM_PROMPT_TIMEOUT="5"

## Type:	yesno
## Default:	yes
#
# Run all scripts or rather start/stop all services
# which are independent from each other in parallel.
#
RUN_PARALLEL="yes"

## Type:	yesno
## Default:	no
#
# If set to "yes" this enables to stop the boot process by
# pressing Ctrl-S and continue with Ctrl-Q (xon/xoff
# flow control).
#
FLOW_CONTROL="no"

## Type:	integer
## Default:	10
#
# Limit the number of file system checkers that can be running in
# parallel.  This allows configurations which have a large number of
# disks to avoid fsck starting too many file system checkers at once,
# which might overload CPU and memory resources available on the
# system.
#
FSCK_MAX_INST="10"

## Type:        string
## Default:     ""
#
# Set additional parameters for klogconsole, e.g. "-l 7"
#
KLOGCONSOLE_PARAMS=""

## Type:	yesno
## Default:	no
#
# If set to "yes" this enforce to use the boot logging facility
# even if "fastboot" and/or "quiet" was found on the kernel
# command line e.g. specified at /boot/grub/menu.lst in the
# optional kernel parameter list.  The current log can be found
# at /var/log/boot.msg and the last at /var/log/boot.omsg
# 
ENFORCE_BLOGD="no"
