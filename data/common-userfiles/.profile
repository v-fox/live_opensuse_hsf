test -z "$PROFILEREAD" && . /etc/profile || true

## avoiding vi
export EDITOR=nano
export SUDO_EDITOR=kate

## better default compression
#gzip and bzip2 are too stupid to be replaced or configured like that, making alias for shell should be better
#export GZIP=pigz
#export BZIP2=pbzip2
export XZ_OPT="--threads=0 -8 --memlimit-compress=75%"
export ZSTD_CLEVEL="6" ZSTD_THREADS="0"

## we want to set it in $(yast2 proxy)
# Tor Proxy
#export http_proxy=127.0.0.1:8080
#export https_proxy=127.0.0.1:8080
#export ftp_proxy=127.0.0.1:8080
#export no_proxy="localhost,127.0.0.1/8,10.0.0.0/8,192.168.0.0/16,localaddress,.localdomain.com"
#export HTTP_PROXY=127.0.0.1:8080
#export HTTPS_PROXY=127.0.0.1:8080
#export FTP_PROXY=127.0.0.1:8080
#export NO_PROXY="localhost,127.0.0.1/8,10.0.0.0/8,192.168.0.0/16,localaddress,.localdomain.com"

## for hugetlbfs usage
export HUGETLB_PATH=/dev/hugepages

## end beeper nonsense !
# doesn't work
set bell-style none
# the least squeaky beep
setterm --bfreq 25 2> /dev/null
# shut it
setterm --blength 0 2> /dev/null

## set-up JACK
#unalias sox
export AUDIODRIVER=alsa
# SDL 1.x and 2.x have different names for PA output in the save variable and we want pulse shim to ensure proper mixing
unset SDL_AUDIODRIVER
# sound in qemu doesn't work with 'alsa' or 'pa' output because it runs from its own user account
# QEMU_AUDIO_DRV='spice' should be used locally and 'none' - from VNC. beter to leave it empty for autodetection
unset QEMU_AUDIO_DRV
alias timidity='timidity -Oj'
alias tvtime='padsp tvtime'
alias fluidsynth='fluidsynth -a jack -l /usr/share/sounds/sf2/FluidR3_GM.sf2'
export ALSA_CONFIG_PATH=/etc/alsa-jack.conf
# kmix crutch to prevent it from fiddling with PA because this POS can't control both real DACs and PA simultaneously
export KMIX_PULSEAUDIO_DISABLE=1
# PA echo cancellation
#export PULSE_PROP="filter.want=echo-cancel"
# gstreamer audio processing quality
# https://gstreamer.freedesktop.org/data/doc/gstreamer/head/gst-plugins-base-libs/html/gst-plugins-base-libs-GstAudio.html
#export GST_AUDIO_DEF_RATE=48000
#export GST_AUDIO_DEF_FORMAT=F32
export GST_AUDIO_RESAMPLER_OPT_FILTER_MODE=GST_AUDIO_RESAMPLER_FILTER_MODE_FULL
export GST_AUDIO_RESAMPLER_OPT_CUTOFF=1.0
export GST_AUDIO_RESAMPLER_QUALITY_MIN=6
export GST_AUDIO_RESAMPLER_QUALITY_DEFAULT=9
export GST_AUDIO_RESAMPLER_OPT_FILTER_MODE_THRESHOLD=335544320
# target PW latency in fractions of a second, has to be sufficient for entire software pipeline
export PIPEWIRE_LATENCY=384/48000
export PIPEWIRE_LINK_PASSIVE=true
## needed for LADSPA-using programs
export LADSPA_PATH=/usr/lib64/ladspa

## set-uo wayland
if [ -n "$WAYLAND_DISPLAY" ]; then
	export XDG_SESSION_TYPE=wayland
	# KDE should figure this out on its own
	export QT_QPA_PLATFORM=wayland-egl
	export QT_WEBENGINE_DISABLE_WAYLAND_WORKAROUND=1
	export GDK_BACKEND=wayland
	export CLUTTER_BACKEND=wayland
	export SDL_VIDEODRIVER=wayland
fi

# https://unix.stackexchange.com/questions/199891/invalid-mit-magic-cookie-1-key-when-trying-to-run-program-remotely
# https://forums.opensuse.org/showthread.php/537783-Invalid-MIT-MAGIC-COOKIE-1-key
if [ -n "$DISPLAY" ]; then
	which xhost > /dev/null && xhost +local: > /dev/null
fi

## making root apps obey
#export XCURSOR_THEME=ComixCursors-Green
#export XCURSOR_SIZE=40

## make sure that DPI is honored
# https://wiki.archlinux.org/index.php/HiDPI
export QT_AUTO_SCREEN_SCALE_FACTOR=1
export PLASMA_USE_QT_SCALING=1
# GTK3 and X itself needs patching to remove hardcoding for 96 dpi

## for QT
#export QT_GRAPHICSSYSTEM=raster

## for GTK/Cairo
export GTKCAIRO_BACKEND=gl

## input method
#export QT_IM_MODULE=ibus
#export GTK_IM_MODULE=ibus
#export XMODIFIERS=@im=ibus

## atk/gtk missing accessibility crutch. http://debbugs.gnu.org/cgi/bugreport.cgi?bug=15154#11
export NO_AT_BRIDGE=1

## font customization
#test -x ~/bin/infinality-settings.sh && . ~/bin/infinality-settings.sh

## set-up kwin
export __GL_SYNC_TO_VBLANK=1
export __GL_YIELD=USLEEP
#export KWIN_TRIPLE_BUFFER=0
export KWIN_USE_INTEL_SWAP_EVENT=1
export KWIN_USE_BUFFER_AGE=3
export KWIN_OPENGL_INTERFACE=egl
export KWIN_DRM_USE_EGL_STREAMS=1
#export KWIN_DIRECT_GL=1
export KWIN_PERSISTENT_VBO=1
#export KWIN_FORCE_LANCZOS=1
#export KWIN_EFFECTS_FORCE_ANIMATIONS=1

## enabling pretty password prompter
# LXQt:'/usr/bin/lxqt-openssh-askpass', GNOME:'/usr/lib64/seahorse/seahorse-ssh-askpass', KDE:'/usr/libexec/ssh/ksshaskpass'
#export SUDO_ASKPASS=/usr/lib64/seahorse/seahorse-ssh-askpass
#export SSH_ASKPASS=/usr/lib64/seahorse/seahorse-ssh-askpass
#export GIT_ASKPASS=/usr/lib64/seahorse/seahorse-ssh-askpass

## https://www.mesa3d.org/envvars.html
export LIBGL_DEBUG=verbose
export PP_DEBUG=1
export GALLIUM_PRINT_OPTIONS=1
export GALLIUM_DUMP_CPU=1
#export AMD_DEBUG="${AMD_DEBUG}info,"
#export RADV_DEBUG="${RADV_DEBUG}info,"
# some sweet overlay debug-info
export GALLIUM_HUD_VISIBLE=false
# SIGUSR1, use `kill -10 $(pidof <name>)`
export GALLIUM_HUD_TOGGLE_SIGNAL=10
# use '0' for "immediate" and integers for seconds. it seems that Mesa does that even when invisible which wastes CPU power
export GALLIUM_HUD_PERIOD=1
# stupid thing also don't bother with DPI ?
#GALLIUM_HUD_SCALE=1
# use `GALLIUM_HUD=help glxgears` for options
export GALLIUM_HUD="cpu+GPU-load+gallium-thread-busy,.dfps+.dframetime,.dbuffer-wait-time;requested-VRAM+VRAM-vis-usage+mapped-VRAM+requested-GTT+GTT-usage+GFX-IB-size,GPU-shaders-busy+GPU-ta-busy+GPU-vgt-busy+GPU-sx-busy+GPU-wd-busy+GPU-sc-busy+GPU-pa-busy+GPU-db-busy+GPU-cp-busy+GPU-cb-busy;.dprimitives-generated+.dclipper-primitives-generated+.ddraw-calls,.dsamples-passed+.dps-invocations"
# for dual-GPU bullshit
# may lead to unintended consequences, like having artifacts or no vsync
export DRI_PRIME=1
# force OpenGL over Vulkan ?
#MESA_LOADER_DRIVER_OVERRIDE=zink
# force software rendering ? should be used if hardware one id broken but
# video output is still active or if you use USB video output dongles
#export LIBGL_ALWAYS_SOFTWARE=1
export SOFTPIPE_DEBUG=use_llvm
export LP_CL=1
# use 'swr' for fast AVX backend or 'llvmpipe' for generic backend
# 'swrast' is obsolete but may also exist
#export GALLIUM_DRIVER=swr
# this should be in ~/.drirc made by `driconf`
# enabling multi-threaded OpenGL in Mesa but it may fail on old hardware
# https://www.gamingonlinux.com/wiki/Performance_impact_of_Mesa_glthread
#export mesa_glthread=true
# MSAA in Mesa
# https://patchwork.freedesktop.org/patch/219866/
# https://gitlab.freedesktop.org/mesa/mesa/-/blob/c56fbed99b4aeb22cec19dc83d75aba79f9fe696/src/gallium/drivers/radeonsi/si_state.c#L3412
#    * Sensible AA configurations:
#    *   EQAA 16s 8z 8f - might look the same as 16x MSAA if Z is compressed
#    *   EQAA 16s 8z 4f - might look the same as 16x MSAA if Z is compressed
#    *   EQAA 16s 4z 4f - might look the same as 16x MSAA if Z is compressed
#    *   EQAA  8s 8z 8f = 8x MSAA
#    *   EQAA  8s 8z 4f - might look the same as 8x MSAA
#    *   EQAA  8s 8z 2f - might look the same as 8x MSAA with low-density geometry
#    *   EQAA  8s 4z 4f - might look the same as 8x MSAA if Z is compressed
#    *   EQAA  8s 4z 2f - might look the same as 8x MSAA with low-density geometry if Z is compressed
#    *   EQAA  4s 4z 4f = 4x MSAA
#    *   EQAA  4s 4z 2f - might look the same as 4x MSAA with low-density geometry
#    *   EQAA  2s 2z 2f = 2x MSAA
export EQAA=8,8,4
# MLAA is better to be set in ~/.drirc but it blurs heavily
#export pp_jimenezmlaa=0
# playing with fire
export MESA_BACK_BUFFER=pixmap
#export MESA_GLX_DEPTH_BITS=24
#export MESA_GLX_ALPHA_BITS=8
# open Radeon driver goodness
export R600_DEBUG="${R600_DEBUG}sbcl,switch_on_eop,precompile,hyperz,sisched,"
#export R600_DEBUG="${R600_DEBUG}forcedma,"
# for OpenCL support on pre-HD7xxx cards with LLVM backend (brakes rendering)
#export R600_DEBUG="${R600_DEBUG}llvm,"
# for better shader rendering but without OpenCL
export R600_DEBUG="${R600_DEBUG}sb,"
# for GL on post-r600 GPUs
export AMD_DEBUG="${AMD_DEBUG}switch_on_eop,gisel,pd,dpbb,"
export AMD_DEBUG="${AMD_DEBUG}nggctess,dfsm,"
# this is only for Navi and newer
#export AMD_DEBUG="${AMD_DEBUG}w32ge,w32ps,w32cs,"
export AMD_DEBUG="${AMD_DEBUG}w64ge,w64ps,w64cs,"
# https://gitlab.freedesktop.org/mesa/mesa/-/merge_requests/4895
#export AMD_DEBUG="${AMD_DEBUG}forcedma,"
# for Vulkan on AMD GPUs
export RADV_TEX_ANISO=16
#export RADV_DEBUG="${RADV_DEBUG}dccmsaa,"
# "faster" ACO backend from Valve or "stable" legacy LLVM backend from AMD ?
#export RADV_DEBUG="${RADV_DEBUG}llvm,"
export RADV_PERFTEST="${RADV_PERFTEST}bolist,localbos,"
# this is known for breaking geometry
export RADV_PERFTEST="${RADV_PERFTEST}dfsm,"
# this is only for Navi and newer
#export RADV_PERFTEST="${RADV_PERFTEST}cswave32,gewave32,pswave32"

## SDL tuning
export SDL_VIDEO_YUV_HWACCEL=1

## supposedly, this is disabled by default for some reason
export VAAPI_MPEG4_ENABLED=1
# hardware video decoding stuff. READ gnote NOTES before changing !
#export LIBVA_DRIVER_NAME=gallium
#export VDPAU_DRIVER=radeonsi

## steam crutches. read up on http://en.opensuse.org/Steam
export STEAM_RUNTIME=1
export STEAM_FRAME_FORCE_CLOSE=1

## Firefox crutches:
# GPU acceleration
export MOZ_USE_OMTC=1
# proper input
export MOZ_USE_XINPUT2=1
# bury GLX ?
export MOZ_X11_EGL=1
# actually enable Wayland support
export MOZ_ENABLE_WAYLAND=1
# force for when FF relentlessly shits itself
export MOZ_WEBRENDER=1
export MOZ_ACCELERATED=1
export MOZ_GLX_IGNORE_BLACKLIST=1

## secret wine crutches
export WINEESYNC=1
export WINEFSYNC=1
export WINE_LARGE_ADDRESS_AWARE=1
export DXVK_ASYNC=1
export STAGING_SHARED_MEMORY=1
export STAGING_RT_PRIORITY_SERVER=4
#export STAGING_RT_PRIORITY_BASE=2

# for enca/enconv
export DEFAULT_CHARSET=UTF-8

# Libre/OO stuff
#export OOO_FORCE_DESKTOP="kde4"

# https://github.com/mpv-player/mpv/pull/7978#issuecomment-673000603
export MPV_HOME="${XDG_CONFIG_HOME:-$HOME/.config}/mpv"

if [ -f ~/TODO ]; then
	cat ~/TODO
fi

### THIS SHOULD BE IN /etc/init.d/after.local !
## update custom meta-theme to account for changes in system themes
#if [ -x /usr/local/share/icons/update-icon-cache ]; then
#	cd /usr/local/share/icons && \
#		./update-icon-cache > /dev/null
#	cd ~
#fi
