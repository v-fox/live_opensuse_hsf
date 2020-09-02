#!/bin/sh
nice -n -14 ionice -c 2 -n 0 caffeinate retroarch "$@"
