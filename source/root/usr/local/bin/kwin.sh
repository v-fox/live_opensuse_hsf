#!/bin/sh

if [ "LXQt" = "$XDG_CURRENT_DESKTOP" ]; then
	KWIN_OPTIONS="--no-kactivities"
fi

if [ -z "$WAYLAND_DISPLAY" ]; then
	export WINDOWMANAGER=kwin_x11
	# load KDE5 services for kwin
	env KDE_SESSION_VERSION=5 kded5 &
	qdbus org.kde.kded5 /kded loadModule colord &
	qdbus org.kde.kded5 /kded loadModule khotkeys &
	exec kwin_x11 $KWIN_OPTIONS
	sleep 10
	kactivitymanagerd stop &
	return 0
else
	export WINDOWMANAGER=kwin_wayland
	export QT_QPA_PLATFORM=wayland-egl
	export GDK_BACKEND=wayland
	export CLUTTER_BACKEND=wayland
	export SDL_VIDEODRIVER=wayland
	return 0
fi
