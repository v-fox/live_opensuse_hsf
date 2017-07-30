#!/bin/sh
nice -n -15 chrt -v -r 70 ionice -c 2 -n 0 retroarch "$@"
