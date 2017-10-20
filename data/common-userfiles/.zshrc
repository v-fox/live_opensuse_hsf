#!/bin/zsh

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
# you may or may not want to add "correctall" option
setopt \
 autocd \
 extendedglob \
 completeinword

unsetopt promptcr

## history
setopt HIST_EXPIRE_DUPS_FIRST
HISTSIZE=15000
SAVEHIST=10000
setopt \
 appendhistory \
 incappendhistory \
 extendedhistory \
 histfindnodups \
 histreduceblanks \
 histignorealldups \
 histsavenodups \
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
autoload -U zstyle+
autoload _have_glob_qual
## enable caching
zstyle ':completion::complete:*' use-cache 1
zstyle ':completion::complete:*' cache-path ~/.zsh/cache/$HOST
## general completion technique
zstyle ':completion:*' completer _complete _list _oldlist _expand _ignored _match _correct _approximate _prefix
## root completion
#zstyle ':completion:*:sudo:*' command-path prepend /usr/local/sbin /usr/sbin /sbin
zstyle ':completion:*:sudo:*' command-path $(echo ${PATH//:/ }) /usr/local/sbin /usr/sbin /sbin
## common hostnames
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
zstyle ':completion:*:*:*:*:processes' menu yes select
zstyle ':completion:*:*:*:*:processes' force-list always
zstyle ':completion:*:*:kill:*:processes' list-colors '=(#b) #([0-9]#)*=0=01;31'
zstyle ':completion:*:*:killall:*:process' list-colors '=(#b) #([0-9]#)*=0=01;31'
# ignore line with rm
zstyle ':completion:*:rm:*' ignore-line yes

# output formatting
## fancy menu selection when there's ambiguity
#zstyle ':completion:*' menu yes select interactive
#zstyle ':completion:*' menu yes=long select=long interactive
zstyle ':completion:*' menu yes select=long interactive
## expand partial paths
zstyle ':completion:*' expand 'yes'
zstyle ':completion:*:expand:*' tag-order all-expansions
zstyle ':completion:*' squeeze-slashes 'yes'
## separate matches into groups
zstyle ':completion:*:matches' group 'yes'
## describe each match group.
zstyle ':completion:*' verbose yes
zstyle ':completion:*:descriptions' format $'%U%B%d%b%u'
## messages/warnings/corrections format
zstyle ':completion:*:messages' format $'%B%U---- %d%u%b'
zstyle ':completion:*:warnings' format $'%BSorry, no matches for: %d%b'
zstyle ':completion:*:corrections' format $'%d (errors: %e)'
zstyle ':completion:*' group-name ''
## describe options in full
zstyle ':completion:*:options' description 'yes'
zstyle ':completion:*:options' auto-description '%d'
## when completing inside array or association subscripts, the array
## elements are more useful than parameters so complete them first:
zstyle ':completion:*:*:-subscript-:*' tag-order indexes parameters 
## add colors to completions
zstyle ':completion:*' list-colors ${(s.:.)LS_COLORS}

compinit -C
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
	PATH="${PATH}:/usr/local/sbin:/usr/sbin:/sbin"
fi

# INITIALISE
#autoload -U zed # what, your shell can't edit files?
#autoload -U zmv # who needs mmv or rename?
zmodload zsh/complist
zmodload zsh/deltochar
zmodload zsh/mathfunc

promptinit
