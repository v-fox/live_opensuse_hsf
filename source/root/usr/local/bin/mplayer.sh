#!/bin/sh
nice -n -2 chrt -v -r 1 mplayer "$@"
