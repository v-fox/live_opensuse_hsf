if [ -n "$DESKTOP_SESSION" ];then
    eval $(gnome-keyring-daemon --start --daemonize)
    export SSH_AUTH_SOCK
fi
