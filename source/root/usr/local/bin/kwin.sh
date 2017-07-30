#!/bin/sh

if [ "LXQt" = "$XDG_CURRENT_DESKTOP" ]; then
	KWIN_OPTIONS="--no-kactivities"
fi

if [ -z "$WAYLAND_DISPLAY" ]; then
	export WINDOWMANAGER=kwin_x11
	exec kwin_x11 $KWIN_OPTIONS
	sleep 10
	exec kactivitymanagerd stop
	# load KDE5 services for kwin
	#kded5 &
	exec qdbus org.kde.kded5 /kded loadModule colord
	#exec qdbus org.kde.kded5 /kded loadModule khotkeys
	return 0
else
	export WINDOWMANAGER=kwin_wayland
	export QT_QPA_PLATFORM=wayland-egl
	export GDK_BACKEND=wayland
	export CLUTTER_BACKEND=wayland
	export SDL_VIDEODRIVER=wayland
	return 0
fi
