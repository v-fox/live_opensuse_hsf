#!/bin/sh
nice -n -18 chrt -v -r 70 mplayer "$@"
