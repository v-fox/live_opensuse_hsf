#!/bin/sh

case "${1}" in
	start)
		pulseaudio -v --kill
		#killall -v pasystray pulseaudio jamin calfjackhost jackd jackdbus lashd
		#killall -v -9 pasystray pulseaudio jamin calfjackhost jackd jackdbus lashd
		systemctl --user stop pipewire
		#chrt -a -v -r -p 30 $(pidof pipewire)
		pidof calfjackhost || \
			exec nice -n -13 ionice -c 2 -n 0 -t chrt -v -f 25 sh -c 'calfjackhost ! --state ~/.config/calf/realtime_processor !' &
		nice -n -10 ionice -c 2 -n 0 -t chrt -v -f 10 pulseaudio --cleanup-shm --start
		systemctl --user start pipewire
		pidof pasystray || \
			exec pasystray &
		exit 0
	;;
	stop)
		pulseaudio -v --kill; killall -v pasystray; killall -v -9 pulseaudio
		killall -v calfjackhost -r 'lsp-plugins-*.'
		killall -v -9 jackd jackdbus lashd pulseaudio
		exit 0
	;;
    *)
        echo "wrong option !"
        exit 1
        ;;
esac
