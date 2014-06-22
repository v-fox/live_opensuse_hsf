#!/bin/bash 

FILE_OVERLAY="source/root"
DIRECTORY="common-userfiles"

cd "${DIRECTORY}"
# removing common files after building, just for tidiness
for i  $(find * -type f); do
	for f in etc/skel root hacker; do
		rm -rf "../../${FILE_OVERLAY}/${f}/${i}"
	done
done
