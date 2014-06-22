#!/bin/bash 

GITIGNORE="source/.gitignore"
DIRECTORY="common-userfiles"

cd "${DIRECTORY}"
# generating empty files to force git not to ignore empty directories
for i in $(find * -type d -empty); do
	echo '!.gitignore' > "${i}/.gitignore"
done

# generating list of copied files for git to ignore
echo > "../../${GITIGNORE}"
for i  $(find * -type f); do
	for f in etc/skel root hacker; do
		echo "root/${f}/${i}" >> "../../${GITIGNORE}"
	done
done
