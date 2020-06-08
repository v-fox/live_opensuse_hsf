#!/bin/sh

pulseaudio -v --kill
killall -v pasystray pulseaudio jamin calfjackhost jackd jackdbus lashd
killall -v -9 pasystray pulseaudio jamin calfjackhost jackd jackdbus lashd
systemctl --user restart pipewire && \
	chrt -v -r -p 30 $(pidof pipewire) && \
	nice -n -13 ionice -c 2 -n 0 -t chrt -v -f 25 sh -c 'calfjackhost ! --state ~/.config/calf/realtime_processor !' &
pasystray &
