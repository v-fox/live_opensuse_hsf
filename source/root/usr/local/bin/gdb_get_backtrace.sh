#!/bin/sh

exe=$1
core=$2

gdb ${exe} \
	--core ${core} \
	--batch \
	--quiet \
	-ex "thread apply all bt full" \
	-ex "quit"
