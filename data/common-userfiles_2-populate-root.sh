#!/bin/bash 

FILE_OVERLAY="source/root"
DIRECTORY="common-userfiles"

cd "${DIRECTORY}"
# copying files
for i in etc/skel root hacker; do
	DESTINATION="../../${FILE_OVERLAY}/${i}"
	[ -e "${DESTINATION}" ] || mkdir -p "${DESTINATION}"
	cp -a ** -t "${DESTINATION}"
	# cleaning up files useless for building
	find "${DESTINATION}" -type f -name ".gitignore" -delete
done
