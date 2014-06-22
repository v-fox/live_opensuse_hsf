#!/bin/bash 

GITIGNORE="source/.gitignore"
DIRECTORY="common-userfiles"

cd "${DIRECTORY}" || exit 1
# generating empty files to force git not to ignore empty directories
for i in $(find . -mindepth 1 -type d -empty -printf '%f\n'); do
	echo '!.gitignore' > "${i}/.gitignore"
done

# generating list of copied files for git to ignore
echo '!.gitignore' > "../../${GITIGNORE}"
for i in $(find . -mindepth 1 -type f ! \( -name '.gitignore' \) -printf '%f\n'); do
	for f in etc/skel root home/hacker; do
		echo "root/${f}/${i}" >> "../../${GITIGNORE}"
	done
done
