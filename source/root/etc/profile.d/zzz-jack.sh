unalias sox
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
