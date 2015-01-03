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
set -f              # turn off globbing
IFS='
'                   # split at newlines only
for i in $(find . -mindepth 1 -type f ! \( -name '.gitignore' \) -printf '%h/%f\n' | sed -e 's:^\./::g' -e 's: :\\ :g'); do
	for f in etc/skel root home/hacker; do
		echo "root/${f}/${i}" >> "../../${GITIGNORE}"
	done
done
unset IFS
set +f
