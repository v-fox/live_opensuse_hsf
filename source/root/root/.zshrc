#!/bin/zsh

# Failure Prompt
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
