test -z "$PROFILEREAD" && . /etc/profile || true

export __GL_SYNC_TO_VBLANK=1
export __GL_YIELD=USLEEP
#export KWIN_TRIPLE_BUFFER=0
export KWIN_USE_INTEL_SWAP_EVENT=1
export KWIN_USE_BUFFER_AGE=8
export KWIN_OPENGL_INTERFACE=egl
#export KWIN_DIRECT_GL=1
#export KWIN_FORCE_LANCZOS=1
export KWIN_PERSISTENT_VBO=1
#export KWIN_EFFECTS_FORCE_ANIMATIONS=1

if [ -x /usr/local/share/icons/update-icon-cache ]; then
	/usr/local/share/icons/update-icon-cache
fi

if [ -n "$WAYLAND_DISPLAY" ]; then
	# KDE should figure this out on its own
	#export QT_QPA_PLATFORM=wayland-egl
	export GDK_BACKEND=wayland
	export CLUTTER_BACKEND=wayland
	export SDL_VIDEODRIVER=wayland
	# educate Firefox on where to draw
	export MOZ_ENABLE_WAYLAND=1
fi

# https://unix.stackexchange.com/questions/199891/invalid-mit-magic-cookie-1-key-when-trying-to-run-program-remotely
# https://forums.opensuse.org/showthread.php/537783-Invalid-MIT-MAGIC-COOKIE-1-key
if [ -n "$DISPLAY" ]; then
	which xhost > /dev/null && xhost +local: > /dev/null
fi
