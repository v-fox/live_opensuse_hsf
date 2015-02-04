#!/bin/sh
nice -n -10 chrt -v -r 10 mplayer "$@"
