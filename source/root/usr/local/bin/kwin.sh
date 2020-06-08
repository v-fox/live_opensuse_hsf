#!/bin/sh

#sleep 5
exec kded5 &
# load KDE5 services for kwin
exec kglobalaccel5 &
#sleep 1
#qdbus org.kde.kded5 /kded loadModule keyboard &
qdbus-qt5 org.kde.kded5 /kded loadModule khotkeys
qdbus-qt5 org.kde.kded5 /kded loadModule kscreen
qdbus-qt5 org.kde.kded5 /kded loadModule colord
qdbus-qt5 org.kde.kded5 /kded loadModule colorcorrectlocationupdater
qdbus-qt5 org.kde.kded5 /kded loadModule ktimezoned
qdbus-qt5 org.kde.kded5 /kded loadModule statusnotifierwatcher
qdbus-qt5 org.kde.kded5 /kded loadModule appmenu
qdbus-qt5 org.kde.kded5 /kded loadModule browserintegrationreminder

# is https://community.kde.org/KWin/Environment_Variables obsolete ?
# https://bugs.kde.org/show_bug.cgi?id=330794
# GLX_EXT_buffer_age on newer Mesa with AMD and Intel GPUs should allow for "partial repaints" vsync to work without slowdown
# or compositing vsync may be disabled if 'TearFree' driver's sync is enabled
# triple buffering adds additional frame of latency but kwin devs REALLY love it
export __GL_YIELD=USLEEP
export KWIN_TRIPLE_BUFFER=0
export KWIN_USE_INTEL_SWAP_EVENT=1
# best used with GLPreferBufferSwap=c which is now fine on Mesa
# >1 should take less time to re-render old content but
# complexity of checking more old frames may result in more overall render time
export KWIN_USE_BUFFER_AGE=3
# Force EGL even under X11 ? same sa GLPlatformInterface=egl
# some effects maybe be broken when EGL is forced on X11
#export KWIN_OPENGL_INTERFACE=egl
# unmaintained kwin blacklists may screw up those
export KWIN_DIRECT_GL=1
export KWIN_FORCE_LANCZOS=1
export KWIN_PERSISTENT_VBO=1
export KWIN_EFFECTS_FORCE_ANIMATIONS=1

if [ "LXQt" == "$XDG_CURRENT_DESKTOP" ]; then
	export QT_PLATFORM_PLUGIN=lxqt
	KWIN_OPTIONS="--no-kactivities"
	# manually jump-start of kscreen2 since LXQt couldn't be bothered to do that itself
	exec /usr/lib64/libexec/kf5/kscreen_backend_launcher &
elif [ "KDE" != "$XDG_CURRENT_DESKTOP" ]; then
	export QT_QPA_PLATFORMTHEME=qt5ct
fi

if [ -z "$WAYLAND_DISPLAY" ]; then
	export WINDOWMANAGER="env mesa_glthread=true nice -n -5 ionice -c 2 -n 0 -t chrt -v -r 5 /usr/bin/kwin_x11 $KWIN_OPTIONS"
	#sleep 1
	#exec env mesa_glthread=true EQAA=8,4,2 pp_jimenezmlaa=32 kwin_x11 $KWIN_OPTIONS &
	#exec kactivitymanagerd stop &
	#kdeinit5 &
	exec /etc/X11/xinit/xinitrc &
	return 0
else
	export WINDOWMANAGER="env mesa_glthread=true nice -n -5 ionice -c 2 -n 0 -t chrt -v -r 20 /usr/bin/kwin_wayland"
	export QT_QPA_PLATFORM=wayland-egl
	export GDK_BACKEND=wayland
	export CLUTTER_BACKEND=wayland
	export SDL_VIDEODRIVER=wayland
	# educate Firefox on where to draw
	export MOZ_ENABLE_WAYLAND=1
	return 0
fi

exit 0
