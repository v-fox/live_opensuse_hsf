#!/bin/bash

# basic variables.
image_arch='x86_64'
declare -a repos=()

dir="$(pwd)"
src="${dir}/source"
dst="${dir}/pan"
img="${dir}/plate"

# Check that we're root.
if [ `whoami` != 'root' ]; then
  echo "Please run this script as root."
  exit 1
fi

if ! [ -d "${src}/" ] || ! [ -d "config" ]; then
  printf "%s: %s\n" \
    "$0" "Cannot find appliance source." \
    >&2
  exit 1
fi

# Check that kiwi is installed.
echo "** Checking for internal repositories..."
kiwi=`which kiwi 2> /dev/null`
if [ $? -ne 0 ]; then
  echo "Kiwi is required but not found on your system."
  echo "Run the following command to install kiwi:"
  echo
  echo "  zypper install kiwi kiwi-tools kiwi-desc-isoboot kiwi-doc"
  echo
  exit 1
fi

# Check architecture (i686, x86_64).
sys_arch=$(uname -m)
linux32=$(which linux32 2>/dev/null)
if [ "${image_arch}" = 'i686' ] && [ "${sys_arch}" = 'x86_64' ]; then
  if [ "${linux32}" = '' ]; then
    echo "'linux32' is required but not found."
    exit 1
  else
    kiwi="${linux32} ${kiwi}"
  fi
elif [ "${image_arch}" = 'x86_64' ] && [ "${sys_arch}" = 'i686' ]; then
  echo "Cannot build ${image_arch} image on a ${sys_arch} machine."
  exit 1
fi

# Variables.
echo "** Setting up versioning variables..."
VERSION_DIST="13.2"
read VERSION_CONFIG < config/version
CONFIG="source/config.xml"
BUILD_DATE="$(date +%Y%m%d)"
NAME="Hackeurs_Sans_Frontieres"
# we need avoid using variables with non-latin symbols inside
# bash loses it shit and spoils the name with escape-encoded crap
NAME_PRETTY=$(echo "${NAME}" | sed 's:_: :g')
NAME_PREFIX="${NAME}-${VERSION_CONFIG}"
OUR_USER="hacker"
SNAPSHOT_NAMEBASE="home/${OUR_USER}/${NAME_PRETTY} - build sources"
SNAPSHOT="source/root/${SNAPSHOT_NAMEBASE} - ${VERSION_CONFIG}_${BUILD_DATE}.tar"
IMAGE="${dst}/${NAME}.${image_arch}-${VERSION_CONFIG}.iso"
IMAGE_PROPER="${img}/Linux Live - HSF - ${VERSION_CONFIG}_${BUILD_DATE}.iso"
PACKAGE_LIST="${dst}/build/image-root/home/${OUR_USER}/${NAME_PRETTY} - package list - ${VERSION_CONFIG}_${BUILD_DATE}.txt"
PACKAGE_LIST_PROPER=${img}/$(basename "${IMAGE_PROPER}" .iso).packages
HASHFILE=$(basename "${IMAGE_PROPER}" .iso).sha256

# No proxy.
echo "** Unsetting proxy variables (because kiwi otherwise shits itself)..."
for i in {http,https,ftp,no}_proxy {HTTP,HTTPS,FTP,NO}_PROXY; do
	unset "${i}" && \
		echo "  no more '${i}'"
done

# Cleaning up #1.
echo "** Forcefully unmounting possible chroot leftovers..."
umount -v -f -l ${dst}/build/image-root/sys/kernel/security
umount -v -f -l ${dst}/build/image-root/sys

echo "** Cleaning up auto-generated files..."
IFS=$'\n'
while read i; do
	for f in $(eval "ls --color=never -1 ${i} 2> /dev/null"); do
		if [ -n "${f}" ]; then
			if [ -e "${f}" ]; then
				echo "  removing '${f}'"
				rm -rf "${f}" || exit 1
			else
				echo "  skipping non-existent '${f}'"
			fi
		fi
	done
done < config/generated
unset IFS

echo "** Duplicating common user-files..."
# putting userfiles in their places
cd "${dir}/data"
./common-userfiles_1-generate-gitignore.sh
./common-userfiles_2-populate-root.sh
cd "${dir}"

echo "** Copying ClamAV and OpenVAS databases from system..."
for directory in clamav openvas/{cert-data,plugins,scap-data}; do
	if [ -e "/var/lib/${directory}" ]; then
		echo "  copying '${directory}'"
		cp -R "/var/lib/${directory}" "source/root/var/lib/${directory}" || exit 1
	fi
done

## config.xml generation.
echo "** Generating ${CONFIG}..."
# header
cat > "${CONFIG}" <<EOF
<?xml version='1.0' encoding='UTF-8'?>
<image name='${NAME}' displayname='${NAME}' schemaversion='5.2'>
EOF
# primary info
cat config/head >> "${CONFIG}"
# build version
cat >> "${CONFIG}" <<EOF
		<version>${VERSION_CONFIG}</version>
	</preferences>
EOF
# users
cat config/users >> "${CONFIG}"
# package selection definition
cat >> "${CONFIG}" <<EOF
	<packages type='image' patternType='onlyRequired'>
		<opensuseProduct name="openSUSE"/>
EOF
# package patterns
while read i; do
	echo "		<namedCollection name='${i}'/>" >> "${CONFIG}"
done < config/packages.patterns
# kernel package
cat config/packages.kernel >> "${CONFIG}"
# packages included in initrd at first and then deleted with no discernible purpose
while read i; do
	echo "		<package name='${i}' bootinclude='true' bootdelete='true'/>" >> "${CONFIG}"
done < config/packages.weird_initrd_bullshit
# packages included in both initrd and root
while read i; do
	echo "		<package name='${i}' bootinclude='true'/>" >> "${CONFIG}"
done < config/packages.root_and_initrd
# packages included only in root / actual system
while read i; do
	echo "		<package name='${i}'/>" >> "${CONFIG}"
done < config/packages.root_only
# bootstrap packagesz
cat >> "${CONFIG}" <<EOF
	</packages>
	<packages type='bootstrap'>
EOF
while read i; do
	echo "		<package name='${i}'/>" >> "${CONFIG}"
done < config/packages.bootstrap
# packages to delete from system before image creation
cat >> "${CONFIG}" <<EOF
	</packages>
	<packages type='delete'>
EOF
while read i; do
	echo "		<package name='${i}'/>" >> "${CONFIG}"
done < config/packages.excluded_from_root
cat >> "${CONFIG}" <<EOF
	</packages>
EOF
# repositories
cat config/repositories >> "${CONFIG}"
cat >> "${CONFIG}" <<EOF
</image>
EOF

# Build sources snapshot's creation.
echo "** Making this build environment's snapshot and putting it out for inclusion into your future image:"
if [ -d .git ]; then
	VERSION_GIT="$(git describe --abbrev=0 | sed 's/v//')"
	VERSION_GIT_FULL="$(git describe | sed 's/v//')"
	# making snapshot of entire sources to put into built image
	git archive --format=tar --prefix="${NAME_PREFIX}"/ HEAD -o "${SNAPSHOT}"
else
	VERSION_GIT="${VERSION_CONFIG}"
	VERSION_GIT_FULL="${VERSION_CONFIG}"
	tar cpf "${SNAPSHOT}" --transform "s:.:./${NAME_PREFIX}/:" -X config/generated .
fi
# adding generated config.xml into snapshot too, just as example
tar rpf "${SNAPSHOT}" --transform "s:^:/${NAME_PREFIX}/:" ${CONFIG}
xz -vv -9 -f "${SNAPSHOT}" || exit 1

# putting README into image
echo "** Making copies of README.md and ChangeLog in user's home: "
cp -v README.md ChangeLog* -t "source/root/home/${OUR_USER}/"

# kiwi repo logic
function url_unknown {
  local repo="${1?}"
  [ -f /etc/kiwi/repoalias ] || return 0
  ! grep -q "^{$repo}" /etc/kiwi/repoalias
}
function add_repo_url {
  local repo="${1?}"
  read -p "Enter repository URL for '${repo}': " url
  mkdir -p /etc/kiwi
  echo "{$repo} ${url}" >> /etc/kiwi/repoalias \
  && echo "	{$repo} ${url} alias added to /etc/kiwi/repoalias"
}
# Replace internal repositories in config.xml.
echo "** Checking for internal repositories..."
for repo in "${repos[@]}"; do
  if grep -q "{$repo}" ${src}/config.xml && url_unknown "${repo}"; then
    add_repo_url "${repo}"
  fi
done

# Set up version.
echo "** Setting up build date to '${BUILD_DATE}' and version to '${VERSION_GIT_FULL}'"
sed 	-e "/BUILD_ID=/s:=.*$:=\"${BUILD_DATE}\":" \
	-e "/VERSION=/s:=.*$:=\"${VERSION_GIT_FULL}\":" \
	-e "/PRETTY_NAME=/s:=.*$:=\"${NAME_PRETTY}\":" \
	-e "/VERSION_ID=/s:=.*$:=\"${VERSION_DIST}\":" \
	-e "/CPE_NAME=/s:=.*$:=\"cpe\:/o\:opensuse\:opensuse\:${VERSION_DIST}\":" \
	data/os-release > source/root/etc/os-release

echo "** Cleaning up building directory..."
if [ -d "${dst}" ]; then
	rm -rf "${dst}"/*
fi
	
echo "** Creating appliance..."
command="$kiwi --verbose 3 --gzip-cmd=lzop --build ${src}/ -d ${dst}"
echo "$command"
$command
if [ $? -ne 0 ]; then
	echo "** Appliance creation failed!"
	exit 1
else
	echo -n "** Copying package list to the top: "
	cp -v "${PACKAGE_LIST}" "${PACKAGE_LIST_PROPER}"
fi

# And we're done!
echo -n "** Moving iso-file: "
mv -v "${IMAGE}" "${IMAGE_PROPER}"

echo "** Creating sha256 checksum..."
cd "${img}"
sha256sum -b "$(basename "${IMAGE_PROPER}")" > "${HASHFILE}"

# Cleaning up #2.
echo "** Cleaning up duplicate files..."
cd "${dir}/data"
./common-userfiles_3-clean-root.sh

echo "** Everything is done, now look into '${img}' !"
