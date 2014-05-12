Hackeurs Sans Frontières - OpenSUSE-based live cd/usb aimed to be fully functional slim desktop system for advanced users
========================================================================================================================

This is live/installation simplistic yet powerful OpenSUSE spin aimed for out-of-the-box desktop usage by advanced users in countries without software patent racket.
It DOES NOT provide encryption and best security defaults, so users with sensitive needs are advised to direct their attention to something like TAILS (https://tails.boum.org), however it should be quite adequate as an installation basis for everyday use.

It provides:
------------
* fresh Stable kernel from Kernel:stable repo, fresh OSS video stack from pontostroy
* slim LXQt (default) and E17 desktop environments from their respective repos
* LeechCraft modular system as a foundation of your basic-needs software kit
* fresh Mozilla Firefox browser and Thunderbird e-mail client for your web-surfing needs
* Clementine audio player, VLC and S/Mplayer video players for your multimedia needs
* LibreOffice, Calibre and GIMP for your documentational needs
* Tor and Polipo for your anti-censorship needs
* zsh, kmscon, nmap and other various console & networking tools
* gparted, testdisk, snapper, disktype and other filesystem tools
* exfat and zfs kernel modules
* bunch of useful repos pre-configured for games, emulators and recent, mostly stable updates

It does NOT provide:
--------------------
— proprietary video drivers (because they suck and are pain in the ass) and video driver support for anything without KMS, for that matter
— KDE or Gnome pre-installed (because of how fat the former and how ugly the later are)
— any language packages (for space conservation). add your language in yast after installation
— Wayland packages (because it's too raw yet)
— printer and scaner support (because that would require a lot of packages without much use on generic installation media)
— cd/dvd/bluray and whatever disk rom utilities (because spinning media must die)
— accessibility features (because i have no idea how to setup them right)

I recommend to use smart SATA boxes with legacy (floppy, disk, virtual partition) emulation like [IODD](www.iodd.co.kr) / [Zalman ZM-*](www.zalman.com/global/product/CategorySecond_Pic.php) series as the replacement for disks and usb drives.

Notes:
------
⊙ Firefox is set up to use Tor by default. you can change that in its proxy settings or use Leechcraft's own webkit browser
⊙ DE-specific apps are included for the lack of adequate analogues
	KDE: dolphin, bluedevil, yakuake, kwrite, okular, gwenview
	GNOME: nm-applet (this is _the only_ NM GUI that can launch in any DE), baobab

Building:
---------
∀ every build comes with its building source in '/home/hacker/Hackeurs Sans Frontières - build code - ${VERSION_CONFIG}_${BUILD_DATE}.tar.xz'
∀ you can build your own image by:
	1) using openSUSE
	2) having "kiwi" and "kiwi-desc-isoboot" packages installed
	3) editing files, starting from 'source/' and 'create_appliance.sh', or not
	4) running `create_appliance.sh`
	5) waiting quite a bit
∀ the process of development for this project is like this:
	1) _future_ release version is set in 'source/version'
	2) desired changes are made and package lists are sorted via `config/sort.sh`
	3) `git commit` issued
	4) image is build via `create_appliance.sh`
	5) image is booted on real hardware and tested, maybe in virtual hardware also
	6) bugs and insufficiencies are noted/reported/filed
	7) fixes made
	8) new image is tested and steps 6-7-8 are repeated until condition is satisfactory
	9) the image that deemed satisfactory is considered as current release, `git tag -a` is issued with "future", now current, version
	10) everythin is repeated
