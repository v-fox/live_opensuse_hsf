#!/bin/bash

# basic variables.
image_arch='x86_64'
declare -a repos=()

dir="$(dirname $0)"
src="$dir/source"
dst="$dir/image"

# Check that we're root.
if [ `whoami` != 'root' ]; then
  echo "Please run this script as root."
  exit 1
fi

if ! [ -d "$src/" ] || ! [ -d "config" ]; then
  printf "%s: %s\n" \
    "$0" "Cannot find appliance source." \
    "$0" "cd into the appliance directory and run './create_appliance.sh'." \
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
sys_arch=`uname -m`
linux32=`which linux32 2>/dev/null`
if [ "$image_arch" = 'i686' ] && [ "$sys_arch" = 'x86_64' ]; then
  if [ "$linux32" = '' ]; then
    echo "'linux32' is required but not found."
    exit 1
  else
    kiwi="$linux32 $kiwi"
  fi
elif [ "$image_arch" = 'x86_64' ] && [ "$sys_arch" = 'i686' ]; then
  echo "Cannot build $image_arch image on a $sys_arch machine."
  exit 1
fi

# Variables.
echo "** Setting up versioning variables..."
read VERSION_CONFIG < config/version
CONFIG="source/config.xml"
BUILD_DATE="$(date +%Y%m%d)"
NAME="Hackeurs_Sans_Frontieres"
NAME_PRETTY=$(echo "${NAME}" | sed 's:_: :g')
NAME_PREFIX="${NAME}-${VERSION_CONFIG}"
OUR_USER="hacker"
# we need avoid using variables like this, with non-latin symbols inside
# bash loses it shit and spoils the name with escape-encoded bullshit
SNAPSHOT_NAMEBASE="home/${OUR_USER}/${NAME_PRETTY} - build sources"
SNAPSHOT="source/root/${SNAPSHOT_NAMEBASE} - ${VERSION_CONFIG}_${BUILD_DATE}.tar"
IMAGE="${dst}/${NAME}.${image_arch}-${VERSION_CONFIG}.iso"
IMAGE_PROPER="Linux Live - HSF - ${VERSION_CONFIG}_${BUILD_DATE}.iso"
PACKAGE_LIST="image/build/image-root/home/${OUR_USER}/${NAME_PRETTY} - ${VERSION_CONFIG}.packages"
PACKAGE_LIST_PROPER=$(basename "${IMAGE_PROPER}" .iso).packages

# Cleaning up.
echo "** CLeaning up auto-generated files..."
while read i; do
	echo "	removing '${i}'"
	rm -fr ${i}
done < config/generated

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
# packages included only in initrd
while read i; do
	echo "		<package name='${i}' bootinclude='true' bootdelete='true'/>" >> "${CONFIG}"
done < config/packages.to_be_deleted_manually_in_scripts_or_some_shit
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
xz -vv -9 "${SNAPSHOT}" || exit 1

# putting README into image
echo -n "** Making copy of README.md in user's home: "
cp -v README.md "source/root/home/${OUR_USER}/"

# kiwi repo logic
function url_unknown {
  local repo="${1?}"
  [ -f /etc/kiwi/repoalias ] || return 0
  ! grep -q "^{$repo}" /etc/kiwi/repoalias
}
function add_repo_url {
  local repo="${1?}"
  read -p "Enter repository URL for '$repo': " url
  mkdir -p /etc/kiwi
  echo "{$repo} $url" >> /etc/kiwi/repoalias \
  && echo "	{$repo} $url alias added to /etc/kiwi/repoalias"
}
# Replace internal repositories in config.xml.
echo "** Checking for internal repositories..."
for repo in "${repos[@]}"; do
  if grep -q "{$repo}" $src/config.xml && url_unknown "$repo"; then
    add_repo_url "$repo"
  fi
done

# Set up version.
echo "** Setting up build date to '${BUILD_DATE}' and version to '${VERSION_GIT_FULL}'"
sed 	-e "/BUILD_ID=/s:=.*$:=\"${BUILD_DATE}\":" \
	-e "/VERSION=/s:=.*$:=\"${VERSION_GIT_FULL}\":" data/os-release \
	> source/root/etc/os-release

echo "** Creating appliance..."
command="$kiwi --build $src/ -d $dst"
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
