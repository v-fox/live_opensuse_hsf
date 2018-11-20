#!/bin/sh

. /usr/lib/tuned/functions

start() {
# autoprobe hardware sensors with default answers
yes '' | sensors-detect

# tune default network scheduller's parameters for all interfaces
# big queue hard limit is just to make sure, codel should auto-limit it below that value as necessary
# 25/250 ms is more realistic target for home networks… in fact, 25 ms target could be increased to 50. see https://bugzilla.redhat.com/show_bug.cgi?id=1169529#c2
# it may be useful to increase memory_limit, 32 MB is a minimal safe value for up to 10G of traffic
# the rest of settings should be in /etc/sysctl.d/99-HSF_tweaks.conf
for interface in $(ls --color=never /sys/class/net/); do
	# remove possible old one, otherwise netlink/tc can shit itself
	tc qdisc del dev ${interface} root
	case ${interface} in
		# loopback
		lo) tc qdisc replace dev ${interface} root fq_codel limit 1000000 target 1ms interval 1000ms;;
		# WiFi
		wl*) tc qdisc replace dev ${interface} root fq_codel limit 100000 flows 10000 target 50ms interval 250ms;;
		# Ethernet
		e*) tc qdisc replace dev ${interface} root fq_codel limit 500000 flows 50000 target 25ms interval 200ms;;
		# else
		*) tc qdisc replace dev ${interface} root fq_codel limit 50000 flows 5000 target 10ms interval 100ms;;
	esac
done

return 0
}

stop() {
return 0
}

process $@
