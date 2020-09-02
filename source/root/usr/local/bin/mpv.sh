#!/bin/sh
RADV_PERFTEST="${RADV_PERFTEST#aco}" nice -n -10 ionice -c 2 -n 1 -t mpv "$@"
