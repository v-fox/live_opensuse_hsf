#!/bin/sh
nice -n -10 ionice -c 2 -n 1 mpv "$@"
