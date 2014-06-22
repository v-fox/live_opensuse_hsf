#!/bin/bash 

FILE_OVERLAY="source/root"
DIRECTORY="common-userfiles"

cd "${DIRECTORY}" || exit 1
# copying files
for i in etc/skel root home/hacker; do
	DESTINATION="../../${FILE_OVERLAY}/${i}"
	[ -e "${DESTINATION}" ] || mkdir -p "${DESTINATION}"
	tar cp . | tar xpf - -C "${DESTINATION}"
	# cleaning up files useless for building
	find "${DESTINATION}" -type f -name ".gitignore" -delete
done
