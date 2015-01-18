#!/bin/bash 

FILE_OVERLAY="source/root"
DIRECTORY="common-userfiles"

cd "${DIRECTORY}" || exit 1
# removing common files after building, just for tidiness
for i in $(find . -mindepth 1 -printf '%f\n'); do
	for f in etc/skel root home/hacker; do
		if [ -e "${i}" ]; then
			rm -rf "../../${FILE_OVERLAY}/${f}/${i}"
		fi
	done
done
