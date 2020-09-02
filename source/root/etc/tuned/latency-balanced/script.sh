#!/bin/bash

. /usr/lib/tuned/functions

start() {
if [ ! -f /etc/sysconfig/lm_sensors ]; then
	# autoprobe hardware sensors with default answers
	yes '' | sensors-detect --auto
fi

# tune default network scheduler's parameters for all interfaces
# https://github.com/systemd/systemd/issues/9725
# https://forum.netgate.com/post/796824
## for FQ_CODEL
# big queue hard limit is just to make sure, codel should auto-limit it below that value as necessary
# 25/250 ms is more realistic target for home networks… in fact, 25 ms target could be increased to 50. see https://bugzilla.redhat.com/show_bug.cgi?id=1169529#c2
# it may be useful to increase memory_limit, 32 MB is a minimal safe value for up to 10G of traffic
## for CAKE
# 'autorate-ingress' may make sense for radio networks but it tends to drop a lot of packets
# one or several 'ether-vlan' parameters may be necessary for PPPoE links, 'atm' is needed for DSL (and GPON ?)
# but any packet size overhead compensations may make sense only on uplinks themselves
# RTT for AQM may be tighter for wired connections (Ethernet, GPON, DSL, etc.) and looser for radio (WiFi, etc.) but the real target time is defined by uplink of the gateway, not hosts
# for time delay compensation you may want 'lan'/1ms for best internal connections, 'metro'/10ms or 'regional'/30ms for good wired external connections, 'internet'/100ms or 'oceanic'/300ms for wireless
## there is also FQ_PIE now but CAKE should be superior in its algorithm

# the rest of settings should be in /etc/sysctl.d/99-HSF_tweaks.conf
for interface in $(ls --color=never /sys/class/net/); do
	# remove possible old one, otherwise netlink/tc can shit itself
	#tc qdisc del dev "${interface}" root
	# make queue big on all interfaces
	#ip l set "${interface}" txqueuelen 16384
	
	# https://www.kernel.org/doc/Documentation/networking/scaling.txt
	# https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/performance_tuning_guide/sect-red_hat_enterprise_linux-performance_tuning_guide-networking-configuration_tools#sect-Red_Hat_Enterprise_Linux-Performance_Tuning_Guide-Configuration_tools-Configuring_Receive_Packet_Steering_RPS
	# should be net.core.rps_sock_flow_entries divided by number of hardware queues (rx-*) which is 0 (single) for SOHO chips
	local SYSTEM_FLOWS=$(sysctl -n net.core.rps_sock_flow_entries)
	local INTERFACE_QUEUES=$(ls -d /sys/class/net/"${interface}"/queues/rx-*/ | wc -l)
	echo "$[ ${SYSTEM_FLOWS%.*} / ${INTERFACE_QUEUES%.*} ]" > /sys/class/net/${interface}/queues/rx-*/rps_flow_cnt
	case "${interface}" in
		# loopback
		lo)
			ip l set "${interface}" gso_max_size 65536 gso_max_segs 128 txqueuelen 16384
			# FQ_CODEL
			#tc qdisc replace dev "${interface}" root fq_codel limit 16384 flows 1024 target 1ms interval 20ms ecn
			# CAKE
			tc qdisc replace dev "${interface}" root cake rtt 20ms flows diffserv4 no-split-gso memlimit 32MB
			# SFQ
			#tc qdisc replace dev "${interface}" root sfq divisor 4096 limit 16384 redflowlimit 2097152 perturb 86400 flows 1024 ecn
			# add addresses for DNSCrypt tunnels and systemd-resolved cacher & LAN multicast resolver
			# these are not actually necessary
			ip a add 127.0.0.53/8 label "${interface}":resolved scope host dev "${interface}"
			ip a add 127.1.0.1/8 label "${interface}":dnscrypt dev "${interface}"
		;;
		# WiFi
		wl*)
			# force conservative (for less load on gate) or aggressive (less load on host) MTU ?
			ip l set "${interface}" gso_max_size 16384 gso_max_segs 4 multicast on txqueuelen 1024
			ip l set "${interface}" mtu 2304 || ip l set "${interface}" mtu 1480
			# it's recommended to "set quantum to the size of 1 or 2 mtu" to eliminate possible interference with RT tasks
			ethtool -K "${interface}" rx on tx off gro on rx-gro-list on tso off
			# FQ_CODEL
			#tc qdisc replace dev "${interface}" root fq_codel limit 16384 flows 5120 target 20ms interval 125ms quantum 2327 ecn
			# CAKE
			tc qdisc replace dev "${interface}" root cake rtt 80ms flows diffserv4 no-split-gso
		;;
		# Ethernet
		e*)
			# force conservative (for less load on gate) or aggressive (less load on host) MTU ?
			ip l set "${interface}" gso_max_size 8192 gso_max_segs 8 multicast on txqueuelen 1024
			ip l set "${interface}" mtu 9194 || ip l set "${interface}" mtu 9000 || ip l set "${interface}" mtu 1480
			# TSO may be broken on some chips
			# CAKE doesn't like GSO
			# also, TSO and GRO are detrimental on 1Gb/s speeds and below
			# SG seems to be bad for speeds too: https://www.spinics.net/lists/netdev/msg591556.html
			# it's not clear if tx-nocache-copy is beneficial when it works and when it doesn't data goes back and forth, wasting time and CPU cycles
			# it shouldn't be enabled if {rx,tc}vlan is not supported and vlans are used: https://www.redhat.com/en/blog/pushing-limits-kernel-networking
			# "tx-nocache-copy off rx on tx on sg off ufo on gro on rx-gro-list on gso off tso off lro off rxvlan on txvlan on ntuple on rxhash on" should be safe
			ethtool -K "${interface}" rx on tx off sg off tso off gso off ufo on gro on rx-gro-list on lro on ntuple on rxhash on
			# https://01.org/linux-interrupt-moderation
			# Adaptive Coalescence may be unsupported, with higher values latency worsens but CPU deadline interference lessens
			# it's nice to have fewer interrupts but some chips, especially Realtek, may screw up if this is enabled
			# nullify default bad 1-frame configuration ? it can only be done when time-based or adaptive config is enabled and resets itself on glitches
			#ethtool -C "${interface}" rx-usecs 499 tx-usecs 499 rx-frames 32 tx-frames 32
			# "rx-frames 1024 tx-frames 4096" seems like decent compromise… when it's supported
			#ethtool -C "${interface}" rx-frames 1024 tx-frames 4096 rx-usecs 0 tx-usecs 0
			#ethtool -C "${interface}" adaptive-rx on adaptive-tx on
			# sometimes when qdisc uses flow-modes Ethernet drivers shit themselves hard to the point of halting the whole system permanently
			# FQ_CODEL
			#tc qdisc replace dev "${interface}" root fq_codel limit 16384 flows 32768 target 15ms interval 100ms quantum 3028 ecn
			# CAKE
			tc qdisc replace dev "${interface}" root cake ethernet ether-vlan rtt 60ms flows diffserv4 no-split-gso ack-filter
			# SFQ
			#tc qdisc replace dev "${interface}" root sfq divisor 4096 limit 16384 redflowlimit 2097152 perturb 86400 flows 1024 ecn
		;;
		# else
		*)
			# FQ_CODEL
			#tc qdisc replace dev "${interface}" root fq_codel limit 16384 flows 10240 target 10ms interval 100ms ecn
			# CAKE
			tc qdisc replace dev "${interface}" root cake flows diffserv4
		;;
	esac
done

return 0
}

stop() {
return 0
}

process $@
