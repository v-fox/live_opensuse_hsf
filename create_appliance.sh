#!/bin/bash
# ============================================================================
# Script for creating appliances exported from SUSE Studio
# (http://susestudio.com) on your local system.
#
# Requires kiwi (http://opensuse.github.com/kiwi/).
#
# Author:  James Tan <jatan@suse.de>
# Contact: feedback@susestudio.com
# ============================================================================

image_arch='x86_64'
base_system='13.1'
declare -a repos=()

dir="$(dirname $0)"
src="$dir/source"
dst="$dir/image"

if ! [ -d "$src/" ] || ! [ -f "$src/config.xml" ]; then
  printf "%s: %s\n" \
    "$0" "Cannot find appliance source." \
    "$0" "cd into the appliance directory and run './create_appliance.sh'." \
    >&2
  exit 1
fi

# Prints and runs the given command. Aborts if the command fails.
function run_cmd {
  command=$1
  echo $command
  $command
  if [ $? -ne 0 ]; then
    echo
    echo "** Appliance creation failed!"
    exit 1
  fi
}

# Display usage.
function usage {
  echo >&2 "Usage:"
  echo >&2 "  create_appliance.sh"
}

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
  && echo "{$repo} $url alias added to /etc/kiwi/repoalias"
}

# Check that we're root.
if [ `whoami` != 'root' ]; then
  echo "Please run this script as root."
  exit 1
fi

# Check that kiwi is installed.
kiwi=`which kiwi 2> /dev/null`
if [ $? -ne 0 ]; then
  echo "Kiwi is required but not found on your system."
  echo "Run the following command to install kiwi:"
  echo
  echo "  zypper install kiwi kiwi-tools kiwi-desc-* kiwi-doc"
  echo
  exit 1
fi

echo "Note:  For a local build you will need a Kiwi version that supports building schemaversion $schema_ver or higher."

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

# Replace internal repositories in config.xml.
echo "** Checking for internal repositories..."
for repo in "${repos[@]}"; do
  if grep -q "{$repo}" $src/config.xml && url_unknown "$repo"; then
    add_repo_url "$repo"
  fi
done

# setting version


BUILD_DATE="$(date +%Y%m%d)"
VERSION_GIT="$(git describe --abbrev=0 | sed 's/v//')"
read_dom () { local IFS=\> ; read -d \< E C ;}
VERSION_CONFIG=$(
while read_dom; do
    if [[ "${E}" = version ]]; then
        echo "${C}"
        exit
    fi
done < source/config.xml)

echo "Setting up build date to ${BUILD_DATE}"
sed -i "/BUILD_ID=/s:=.*$:=\"${BUILD_DATE}\":" source/root/etc/os-release
echo "Setting up version to ${VERSION_CONFIG}"
sed -i "/VERSION=/s:=.*$:=\"${VERSION_CONFIG}\":" source/root/etc/os-release

# Create appliance.
echo
echo "** Creating appliance..."
rm -rf build/root

run_cmd "$kiwi --build $src/ -d $dst"

# And we're done!
