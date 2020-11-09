#!/bin/sh
PV_HOME="${XDG_CONFIG_HOME:-$HOME/.config}/mpv" RADV_DEBUG="${RADV_DEBUG}llvm," nice -n -10 ionice -c 2 -n 1 -t mpv "$@"
