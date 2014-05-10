#
# spec file for package branding-HSF
#
# Copyright (c) 2013 SUSE LINUX Products GmbH, Nuernberg, Germany.
#
# All modifications and additions to the file contributed by third parties
# remain the property of their copyright owners, unless otherwise agreed
# upon. The license for this file, and modifications and additions to the
# file, is the same license as for the pristine package itself (unless the
# license for the pristine package is not an Open Source License, in which
# case the license is the MIT License). An "Open Source License" is a
# license that conforms to the Open Source Definition (Version 1.9)
# published by the Open Source Initiative.

# Please submit bugfixes or comments via http://bugs.opensuse.org/
#


Name:           branding-HSF
Version:        1
Release:        0
Provides:       branding
Conflicts:      otherproviders(branding)
Url:            https://build.opensuse.org/package/show/home:X0F:HSF/branding
Source0:        wallpapers-branding-HSF.tar.xz
Source1:        plymouth-branding-HSF.tar.xz
Source2:        grub2-branding-HSF.tar.xz
Source3:        gfxboot-branding-HSF.tar.xz
BuildRoot:      %{_tmppath}/%{name}-%{version}-build
%ifarch x86_64 %ix86
%define package_gfxboot 1
BuildRequires:  gfxboot-devel
%endif
%ifarch %{ix86} x86_64 ppc ppc64
%define package_grub2_theme 1
BuildRequires:  grub2
%endif
Summary:        HSF Brand File
License:        BSD-3-Clause
Group:          System/Fhs
BuildRequires:  fdupes
BuildRequires:  fribidi
BuildRequires:  update-desktop-files
BuildArch:      noarch

%description
This package contains the file /etc/HSF-brand, and its name is used as
a trigger for installation of correct vendor brand packages.

%define theme_name HSF

%if 0%{?package_gfxboot} > 0

%package        -n gfxboot-branding-HSF
Summary:        Graphical bootloader HSF theme
License:        BSD-3-Clause
Group:          System/Boot
PreReq:         gfxboot >= 4
Supplements:    packageand(gfxboot:branding-HSF)
Provides:       gfxboot-branding = %{version}
Provides:       gfxboot-theme = %{version}
Conflicts:      otherproviders(gfxboot-branding)
BuildArch:      noarch

%description -n gfxboot-branding-HSF
HSF theme for gfxboot (graphical bootloader for grub).
%endif

%package -n wallpaper-branding-HSF
Summary:        HSF default wallpapers
License:        BSD-3-Clause
Group:          System/Fhs
Requires(post): update-alternatives
Requires(postun): update-alternatives
Provides:       wallpaper-branding = %{version}
Conflicts:      otherproviders(wallpaper-branding)
BuildArch:      noarch

%description -n wallpaper-branding-HSF
HSF defaults wallpapers

%if 0%{?package_grub2_theme} > 0

%package -n grub2-branding-HSF
Summary:        HSF branding for GRUB2's graphical console
License:        CC-BY-SA-3.0
Group:          System/Fhs
Requires:       grub2
Provides:       grub2-branding = %{version}
Supplements:    packageand(grub2:branding-HSF)
Conflicts:      otherproviders(grub2-branding)
BuildArch:      noarch

%description -n grub2-branding-HSF
HSF branding for the GRUB2's graphical console
%endif

%package -n plymouth-branding-HSF
Summary:        HSF branding for Plymouth bootsplash
License:        GPL-2.0+
Group:          System/Fhs
Requires:       plymouth-plugin-label
PreReq:         plymouth-plugin-script
PreReq:         plymouth-scripts
Supplements:    packageand(plymouth:branding-HSF)
Provides:       plymouth-branding = %{version}
Conflicts:      otherproviders(plymouth-branding)
BuildArch:      noarch

%description -n plymouth-branding-HSF
HSF branding for the plymouth bootsplash

%prep
# just look at this retarded shit... i miss ebuilds :(
%setup -q -c
%setup -q -T -D -a 1
%setup -q -T -D -a 2
%setup -q -T -D -a 3

%build
cat > etc/HSF-brand <<EOF
HSF
VERSION = %{version}
EOF

%install
# gfxboot should use a link /etc/bootsplash/theme -> %{_datadir}/bootsplash
install -d -m 755 %{buildroot}/etc/bootsplash/themes/HSF/{bootloader,cdrom}
%{_datadir}/gfxboot/bin/unpack_bootlogo %{buildroot}/etc/bootsplash/themes/HSF/cdrom
%{_datadir}/gfxboot/bin/2hl --link --quiet %{buildroot}/etc/bootsplash/themes/HSF/*
mkdir %{buildroot}/boot
touch %{buildroot}/boot/message

# move everything into places
cp -avf * -t %{buildroot}
%fdupes %{buildroot}%{_datadir}/backgrounds

for i in $(find %{buildroot}%{_datadir}/wallpapers -iname "*.desktop"); do
    %suse_update_desktop_file "${i}"
done
%suse_update_desktop_file %{buildroot}%{_datadir}/wallpapers/HSF/metadata.desktop
# Touch the file handled with update-alternatives
touch %{buildroot}%{_datadir}/wallpapers/HSF.xml

# remove
%if 0%{?package_grub2_theme} < 1
rm -rf %{buildroot}/%{_datadir}/grub2
%else
install -d -m 755 %{buildroot}/boot/grub2/{backgrounds,themes}
%endif

%if 0%{?package_gfxboot} > 0
%post -n gfxboot-branding-HSF
gfxboot --update-theme HSF
%endif

%post -n wallpaper-branding-HSF
update-alternatives --install %{_datadir}/wallpapers/HSF.xml HSF.xml %{_datadir}/wallpapers/HSF-static.xml 5

%postun -n wallpaper-branding-HSF
# Note: we don't use "$1 -eq 0", to avoid issues if the package gets renamed
if [ ! -f %{_datadir}/wallpapers/HSF-static.xml ]; then
  update-alternatives --remove HSF.xml %{_datadir}/wallpapers/HSF-static.xml
fi

%if 0%{?package_grub2_theme} > 0
%post -n grub2-branding-HSF
%{_datadir}/grub2/themes/%theme_name/activate-theme
if test -e /boot/grub2/grub.cfg ; then
  /usr/sbin/grub2-mkconfig -o /boot/grub2/grub.cfg || true
fi

%postun -n grub2-branding-HSF
if [ $1 = 0 ] ; then
  rm -rf /boot/grub2/themes/%theme_name
fi
%endif

%post -n plymouth-branding-HSF
export LIB=%{_libdir}
OTHEME="$(%{_sbindir}/plymouth-set-default-theme)"
if [ "$OTHEME" == "text" -o "$OTHEME" == "HSF" ]; then
   if [ ! -e /.buildenv ]; then
     %{_sbindir}/plymouth-set-default-theme -R HSF
   else
     %{_sbindir}/plymouth-set-default-theme HSF
   fi
fi

%postun -n plymouth-branding-HSF
if [ $1 -eq 0 ]; then
    export LIB=%{_libdir}
    if [ "$(%{_sbindir}/plymouth-set-default-theme)" == "HSF" ]; then
        %{_sbindir}/plymouth-set-default-theme -R --reset
    fi
fi

%files
%defattr(-,root,root)
%{_sysconfdir}/HSF-brand

%if 0%{?package_gfxboot} > 0

%files -n gfxboot-branding-HSF
%defattr(-,root,root)
%{_sysconfdir}/bootsplash
%ghost /boot/message
%endif

%files -n wallpaper-branding-HSF
%defattr(-,root,root)
%ghost %{_datadir}/wallpapers/HSF.xml
%{_datadir}/wallpapers/

%if 0%{?package_grub2_theme} > 0
%files -n grub2-branding-HSF
%defattr(-,root,root)
%{_datadir}/grub2
%dir /boot/grub2
%dir /boot/grub2/backgrounds
%dir /boot/grub2/themes
%ghost /boot/grub2/backgrounds/HSF
%ghost /boot/grub2/themes/HSF
%endif

%files -n plymouth-branding-HSF
%defattr(-, root, root)
%{_datadir}/plymouth/themes/HSF/

%changelog
