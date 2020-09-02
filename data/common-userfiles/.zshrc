#!/bin/zsh

# for no reason SUSE decided to not do this by default anymore
source /etc/bash.bashrc
source /etc/zshrc

if [ -f ~/.profile ]; then
	source ~/.profile
fi

# make everything prettier
autoload -U colors
eval $(dircolors)
ZLS_COLORS=$LS_COLORS
colors

# make sure that locale is adequate
if [ -z "$LANG" ] || [ "$LANG" = "POSIX" ] || [ "$LANG" = "C" ]; then
	unset LC_ALL
	[ -f /etc/locale.conf ] && \
		eval $(cat /etc/locale.conf)
	[ -f ~/.locale.conf ] && \
		eval $(~/.locale.conf)
	[ -f ~/locale/locale.conf ] && \
		eval $(cat ~/locale/locale.conf)
	# last resort, just to make sure that UTF-8 is supported
	if [ -z "$LANG" ] || [ "$LANG" = "POSIX" ] || [ "$LANG" = "C" ]; then
		LC_ALL=en_DK.UTF-8
	fi
	if [ -z "$LANG" ] || [ "$LANG" = "POSIX" ] || [ "$LANG" = "C" ]; then
		# US uses moronic date, number and measurement formats, so we'd want to avoid them
		LC_ALL=en_US.UTF-8
	fi
fi

# for ssh authentication
pidof ssh-agent &>/dev/null || \
	eval $(ssh-agent) > /dev/null
ssh-add &> /dev/null

# options
## you may or may not want to add "CORRECT_ALL" option
setopt \
 AUTO_CD \
 AUTO_LIST \
 AUTO_MENU \
 AUTO_NAME_DIRS \
 EXTENDED_GLOB \
 COMPLETE_IN_WORD \
 COMPLETE_ALIASES \
 GLOB \
 GLOB_COMPLETE \
 GLOB_SUBST \
 LIST_PACKED \
 LIST_TYPES \
 MULTIBYTE \
 NUMERIC_GLOB_SORT
## unwanted options
unsetopt \
 ALWAYS_TO_END \
 BASH_AUTO_LIST \
 NOMATCH \
 BEEP \
 LIST_AMBIGUOUS \
 LIST_BEEP \
 LIST_ROWS_FIRST \
 MENU_COMPLETE \
 PROMPT_CR \
 REC_EXACT

## history
HISTSIZE=15000
SAVEHIST=10000
setopt \
 APPEND_HISTORY \
 SHARE_HISTORY \
 EXTENDED_HISTORY \
 HIST_FIND_NO_DUPS \
 HIST_EXPIRE_DUPS_FIRST \
 HIST_REDUCE_BLANKS \
 HIST_IGNORE_ALL_DUPS \
 HIST_SAVE_NO_DUPS \
 HIST_REDUCE_BLANKS \
 HIST_IGNORE_SPACE

 # maximum size of completion listing
LISTMAX=0    # Only ask if line would scroll off screen
#LISTMAX=1000  # "Never" ask

# watching for other users
#LOGCHECK=60
#WATCHFMT="[%B%t%b] %B%n%b has %a %B%l%b from %B%M%b"
#watch=(notme)

# completion defaults
autoload -U compinit
autoload -U bashcompinit
autoload -U zstyle+
autoload _have_glob_qual
## enable caching
zstyle ':completion::complete:*' use-cache 1
zstyle ':completion::complete:*' cache-path ~/.zsh/cache/$HOST
## general completion technique
zstyle ':completion:*' completer _complete _list _oldlist _expand _ignored _match _correct _approximate _prefix
## root completion
#zstyle ':completion:*:sudo:*' command-path prepend /usr/local/sbin /usr/sbin /sbin
zstyle ':completion:*:sudo:*' command-path `echo ${PATH//:/ }` /usr/local/sbin /usr/sbin /sbin
## common hostnames
zstyle ':completion:*' use-ip 'true'
local _etc_hosts _known_hosts _ssh_hosts
[ -f /etc/hosts ] && \
	_etc_hosts=( ${${${(f)"$(</etc/hosts)"}/\#*}#*[\t ]} )
[ -f ~/.ssh/known_hosts ] && \
	_known_hosts=( ${${(f)"$(<~/.ssh/known_hosts)"}//[ ,#]*/} )
[ -f ~/.ssh/config ] && \
	_ssh_hosts=( ${${${(f)"$(egrep -i '^\W*host\W' ~/.ssh/config)"}//* /}%%*\**} )
zstyle ':completion:*' hosts $_etc_hosts $_known_hosts
zstyle ':completion:*:(ssh|scp|sftp|ftp):*' hosts $_etc_hosts $_known_hosts $_ssh_hosts
unset _etc_hosts _known_hosts _ssh_hosts
## kill completion
zstyle ':completion:*:process' command 'ps xauwww -U $USER -u $USER'
zstyle ':completion:*:processes' command 'ps xcu -U $USER -u $USER'
zstyle ':completion:*:*:*:*:processes' menu 'true' select
zstyle ':completion:*:*:*:*:processes' force-list always
zstyle ':completion:*:*:kill:*:processes' list-colors '=(#b) #([0-9]#)*=0=01;31'
zstyle ':completion:*:*:killall:*:process' list-colors '=(#b) #([0-9]#)*=0=01;31'
## ignore line with rm
zstyle ':completion:*:rm:*' ignore-line 'true'

# output formatting
## add colors to completions
zstyle ':completion:*' list-colors ${(s.:.)LS_COLORS}
## always put directories first
zstyle ':completion:*' list-dirs-first 'true'
## fancy menu selection when there's ambiguity
#zstyle ':completion:*' menu 'true' select interactive
#zstyle ':completion:*' menu 'yes=long' select=long interactive
zstyle ':completion:*' menu 'true' select=long interactive
zstyle ':completion:*' show-ambiguity 'true'
## expand partial paths
zstyle ':completion:*' expand 'true'
zstyle ':completion:*:expand:*' tag-order all-expansions
zstyle ':completion:*' squeeze-slashes 'true'
## separate matches into groups
zstyle ':completion:*:matches' group 'true'
## make manuals pretty
zstyle ':completion:*:manuals' separate-sections true
zstyle ':completion:*:manuals.(^1*)' insert-sections true
zstyle ':completion:*:man:*' menu yes select
## describe each match group.
zstyle ':completion:*' verbose 'true'
zstyle ':completion:*:descriptions' format $'%U%B%d%b%u'
## messages/warnings/corrections format
zstyle ':completion:*:default' list-prompt '%S%M matches%s'
zstyle ':completion:*:messages' format $'%B%U---- %d%u%b'
zstyle ':completion:*:warnings' format $'%BSorry, no matches for: %d%b'
zstyle ':completion:*:corrections' format $'%d (errors: %e)'
zstyle ':completion:*' group-name ''
## describe options in full
zstyle ':completion:*:options' description 'true'
zstyle ':completion:*:options' auto-description '%d'
## when completing inside array or association subscripts, the array
## elements are more useful than parameters so complete them first:
zstyle ':completion:*:*:-subscript-:*' tag-order indexes parameters
## guesses ?
zstyle -e ':completion:*:approximate:*' max-errors 'reply=( $(( ($#PREFIX + $#SUFFIX) / 3 )) )'
zstyle ':completion::approximate*:*' prefix-needed false
#zstyle ':completion::(^approximate*):*:functions' ignored-patterns '_*'
## show completion progress. useful with long and hard completions
zstyle ':completion:*' show-completer 'true'

compinit -C
bashcompinit -C
autoload -U promptinit

# failure prompt
SPROMPT=$'%BError!%b Correct %{\e[31m%}%R%{ \e[0m%}to%{ \e[36m%}%r%{ \e[0m%}? [No/Yes/Abort/Edit]: '

# fancy prompt
export BLACK="%{"$'\033[01;30m'"%}"
export GREEN="%{"$'\033[01;32m'"%}"
export RED="%{"$'\033[01;31m'"%}"
export YELLOW="%{"$'\033[01;33m'"%}"
export BLUE="%{"$'\033[01;34m'"%}"
export BOLD="%{"$'\033[01;39m'"%}"
export NORM="%{"$'\033[00m'"%}"

if [ "`id -u`" = "0" ]; then
	PROMPT="@${RED}%M${NORM} (${YELLOW}%D - %*${NORM}) [ ${BLUE}%~${NORM} ] ${RED}##${NORM} ";
else
	PROMPT="${GREEN}%n${NORM}@${GREEN}%m${NORM} (${YELLOW}%*${NORM}) [ ${BLUE}%~${NORM} ] ${BLUE}%#${NORM} ";
#	PS1='%n@%m (%T) [ %~ ] %# ';
	PATH="${PATH}:/usr/local/sbin:/usr/sbin:/sbin:${HOME}/.local/bin"
fi

# force some useful default options with aliases
alias ls='ls --group-directories-first --color=yes'
alias ip='ip -c -d -h'
alias tc='tc -ts -s -d -p -g -iec -nm'
alias lspci-tree='lspci -t -PP -q -k -v'
alias lsusb-tree='lsusb -t -v'
# compression shims
$(which pigz > /dev/null) && alias gzip='pigz'
$(which pbzip2 > /dev/null) && alias bzip2='pbzip2'
# prefer wine that can launch all Windows binaries
#alias wine="wine64"
alias winetricks="env WINEARCH=win64 winetricks"
# prevent wine from shitting in /home,especially if it's on small SSD partition
# (something has to be done too with its tendency to create file-associations with its monstrous crap)
[ -d "/var/cache/WINE/$USER/x86" ] || mkdir -p "/var/cache/WINE/$USER/x86" 2> /dev/null
[ -d "/var/cache/WINE/$USER/x86_64" ] || mkdir -p "/var/cache/WINE/$USER/x86_64" 2> /dev/null
[ -e ~/.wine ] || ln -s "/var/cache/WINE/$USER/x86" ~/.wine 2> /dev/null
[ -e ~/.wine64 ] || ln -s "/var/cache/WINE/$USER/x86_64" ~/.wine64 2> /dev/null
[ -e ~/.local/share ] || mkdir -p ~/.local/share 2> /dev/null
[ -e ~/.local/share/wineprefixes ] || ln -s "/var/cache/WINE/$USER" ~/.local/share/wineprefixes 2> /dev/null
export WINEARCH=win64
export WINEPREFIX="/var/cache/WINE/$USER/x86_64"

# INITIALISE
#autoload -U zed # what, your shell can't edit files?
#autoload -U zmv # who needs mmv or rename?
zmodload zsh/complist
zmodload zsh/deltochar
zmodload zsh/mathfunc

promptinit
