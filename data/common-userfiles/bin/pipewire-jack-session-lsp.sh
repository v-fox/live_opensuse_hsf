#!/bin/sh

if [ -z "$CHECK_RT" ]; then
	CHECK_RT=1
fi

if [ -z "$PIPEWIRE_EMULATES_JACK" ]; then
	PIPEWIRE_EMULATES_JACK=0
fi

if [ -z "$PREFER_ANTISURGE_OVER_GATE" ]; then
	PREFER_ANTISURGE_OVER_GATE=1
fi

case "${1}" in
	start)
		if ( [ "${CHECK_RT}" = 1 ] && (zcat /proc/config.gz | grep -i 'PREEMPT_RT=y')); then
			RT_KERNEL=1
		else
			RT_KERNEL=0
		fi
		
		pulseaudio -v --kill; killall -v pulseaudio
		# these 2 lines should be done in session manager, such as qjackctl
		#killall -v pasystray pulseaudio jamin calfjackhost jackd jackdbus lashd
		#killall -v -9 pasystray pulseaudio jamin calfjackhost jackd jackdbus lashd
		
		if [ "$PIPEWIRE_EMULATES_JACK" != 1 ]; then
			# stop PW here if real JACK & PA are used, start it and boost its priority, if not
			systemctl --user stop pipewire; killall pipewire
			# this is likely to be an overkill
			#for bastard in $(lsof -t /dev/snd/hw*); do
			#	kill --verbose -p ${bastard} && sleep 1
			#	kill --verbose -9 -p ${bastard}
			#done
		else
			# if PW is replacing JACK and PA then it should start here and not at the end
			systemctl --user start pipewire
			# debug version
			#PIPEWIRE_DEBUG=4 LC_ALL=C pipewire &> ~/.log/"pipewire_[$(date -u +%Y_%m_%d-%H_%M_%S)].log" &
			
			# forcibly elevate priority. this better to be set in systemd unit, see `man systemd.exec`
			#sleep 1;
			#ionice -P $(pidof pipewire) -c 2 -n 0
			# try getting realtime I/O
			#ionice -P $(pidof pipewire) -c 1 -n 6
			#if [ "${RT_KERNEL}" != 1 ]; then
			#	pidof pipewire && chrt -a -v -f -p 30 $(pidof pipewire)
			#fi
		fi
		
		pidof calfjackhost || \
			exec nice -n -11 ionice -c 2 -n 0 -t calfjackhost ! --state ~/.config/calf/stereo_harmonics_enhancer ! &
			sleep 1;
			if [ "${RT_KERNEL}" != 1 ]; then
				pidof calfjackhost && chrt -a -v -f -p 25 $(pidof calfjackhost)
			fi
		
		pidof lsp-plugins-para-equalizer-x16-stereo || \
			exec nice -n -9 ionice -c 2 -n 0 -t lsp-plugins-para-equalizer-x16-stereo -c ~/.config/lsp-plugins/lsp-plugins-peq16.cfg &
			sleep 1;
			if [ "${RT_KERNEL}" != 1 ]; then
				pidof lsp-plugins-para-equalizer-x16-stereo && chrt -a -v -f -p 21 $(pidof lsp-plugins-para-equalizer-x16-stereo)
			fi
		
		# it introduces ridiculous latency of "<FFT_size>/KHzs_of_sampling_rate" !
		#pidof lsp-plugins-loud-comp-stereo || \
		#	exec nice -n -10 ionice -c 2 -n 0 -t lsp-plugins-loud-comp-stereo -c ~/.config/lsp-plugins/lsp-plugins-leq.cfg &
		#	sleep 1;
		#	if [ "${RT_KERNEL}" != 1 ]; then
		#		pidof lsp-plugins-loud-comp-stereo && chrt -a -v -f -p 22 $(pidof lsp-plugins-loud-comp-stereo)
		#	fi
		
		
		if ( [ "${PREFER_ANTISURGE_OVER_GATE}" = 1 ] && (which lsp-plugins-surge-filter-stereo)); then
			# better alternative to using gate against poping
			pidof lsp-plugins-surge-filter-stereo || \
				exec nice -n -8 ionice -c 2 -n 0 -t lsp-plugins-surge-filter-stereo -c ~/.config/lsp-plugins/lsp-plugins-antisurge.cfg &
				sleep 1;
				if [ "${RT_KERNEL}" != 1 ]; then
					pidof lsp-plugins-surge-filter-stereo && chrt -a -v -f -p 23 $(pidof lsp-plugins-surge-filter-stereo)
				fi
		else
			pidof lsp-plugins-gate-stereo || \
				exec nice -n -8 ionice -c 2 -n 0 -t lsp-plugins-gate-stereo -c ~/.config/lsp-plugins/lsp-plugins-gate.cfg &
				sleep 1;
				if [ "${RT_KERNEL}" != 1 ]; then
					pidof lsp-plugins-gate-stereo && chrt -a -v -f -p 23 $(pidof lsp-plugins-gate-stereo)
				fi
		fi
		
		pidof lsp-plugins-mb-compressor-stereo || \
			exec nice -n -8 ionice -c 2 -n 0 -t lsp-plugins-mb-compressor-stereo -c ~/.config/lsp-plugins/lsp-plugins-mbc8.cfg &
			sleep 1;
			if [ "${RT_KERNEL}" != 1 ]; then
				pidof lsp-plugins-mb-compressor-stereo && chrt -a -v -f -p 24 $(pidof lsp-plugins-mb-compressor-stereo)
			fi
		
		sleep 1; pidof lsp-plugins-limiter-stereo || \
			exec nice -n -11 ionice -c 2 -n 0 -t lsp-plugins-limiter-stereo -c ~/.config/lsp-plugins/lsp-plugins-lim.cfg &
			sleep 1;
			if [ "${RT_KERNEL}" != 1 ]; then
				pidof lsp-plugins-limiter-stereo &&  chrt -a -v -f -p 26 $(pidof lsp-plugins-limiter-stereo)
			fi
		
		# it's dangerous to "bypass", it's equivalent of pressing "[allow] feedback" button
		#pidof lsp-plugins-latency-meter || \
		#	exec nice -n -12 ionice -c 2 -n 0 -t lsp-plugins-latency-meter -c ~/.config/lsp-plugins/lsp-plugins-lat.cfg &
		#	sleep 1;
		#	if [ "${RT_KERNEL}" != 1 ]; then
		#		pidof lsp-plugins-latency-meter && chrt -a -v -r -p 1 $(pidof lsp-plugins-latency-meter)
		#	fi
		
		pidof lsp-plugins-spectrum-analyzer-x4 || \
			exec nice -n -13 ionice -c 2 -n 0 -t lsp-plugins-spectrum-analyzer-x4 -c ~/.config/lsp-plugins/lsp-plugins-an.cfg &
			sleep 1;
			if [ "${RT_KERNEL}" != 1 ]; then
				pidof lsp-plugins-spectrum-analyzer-x4 && chrt -a -v -f -p 20 $(pidof lsp-plugins-spectrum-analyzer-x4)
			fi
		
		# if PW is replacing JACK and PA then it should have 30 priority and PA should not be started
		if [ "$PIPEWIRE_EMULATES_JACK" != 1 ]; then
			nice -n -10 ionice -c 2 -n 0 -t chrt -v -r 10 pulseaudio --cleanup-shm --start
			if [ "${RT_KERNEL}" != 1 ]; then
				pidof pulseaudio && chrt -a -v -r -p 10 $(pidof pulseaudio)
			fi
			
			systemctl --user start pipewire; sleep 1;
			if [ "${RT_KERNEL}" != 1 ]; then
				pidof pipewire && chrt -a -v -f -p 5 $(pidof pipewire)
			fi
		fi
		
		sleep 1; pidof pasystray || \
			exec pasystray &
		
		exit 0
	;;
	stop)
		pulseaudio -v --kill; killall -v pasystray; sleep 1; killall -v -9 pulseaudio
		killall -v calfjackhost -r 'lsp-plugins-*.'; sleep 1; killall -v -9 calfjackhost -r 'lsp-plugins-*.'
		killall -v jackd jackdbus lashd
		killall -v -9 jackd jackdbus lashd pulseaudio
		exit 0
	;;
    *)
        echo "wrong option !"
        exit 1
        ;;
esac
