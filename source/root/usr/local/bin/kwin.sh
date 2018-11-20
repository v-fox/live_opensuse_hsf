#!/bin/sh

if [ "LXQt" = "$XDG_CURRENT_DESKTOP" ]; then
	KWIN_OPTIONS="--no-kactivities"
fi

if [ -z "$WAYLAND_DISPLAY" ]; then
	export WINDOWMANAGER=kwin_x11
	# load KDE5 services for kwin
	kded5 &
	kglobalaccel5 &
	sleep 1
	#qdbus org.kde.kded5 /kded loadModule keyboard &
	qdbus org.kde.kded5 /kded loadModule khotkeys &
	qdbus org.kde.kded5 /kded loadModule kscreen &
        qdbus org.kde.kded5 /kded loadModule colord &
        qdbus org.kde.kded5 /kded loadModule colorcorrectlocationupdater &
	sleep 1
	exec env mesa_glthread=true EQAA=8,4,2 pp_jimenezmlaa=32 kwin_x11 $KWIN_OPTIONS
	#sleep 5
	#exec kactivitymanagerd stop
	return 0
else
	export WINDOWMANAGER=kwin_wayland
	export QT_QPA_PLATFORM=wayland-egl
	export GDK_BACKEND=wayland
	export CLUTTER_BACKEND=wayland
	export SDL_VIDEODRIVER=wayland
	return 0
fi
