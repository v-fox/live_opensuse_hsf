#!/bin/sh
nice -n -5 chrt -v -r 15 mplayer "$@"
