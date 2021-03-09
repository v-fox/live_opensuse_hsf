#!/bin/sh
MPV_HOME="${XDG_CONFIG_HOME:-$HOME/.config}/mpv" nice -n -10 ionice -c 2 -n 1 -t mpv "$@"
