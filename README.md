Hackers Without Borders - OpenSUSE-based live cd/usb aimed to be fully functional slim desktop system for advanced users
========================================================================================================================

This is live / installation build of simplistic yet powerful OpenSUSE spin aimed for out-of-the-box desktop usage by advanced users in countries without software patent racket. It DOES NOT provide encryption and best security defaults, so users with sensitive needs are advised to direct their attention to something like TAILS (https://tails.boum.org), however it should be quite adequate as an installation basis for everyday use.

It provides:
------------
* Fresh Stable kernel from Kernel:stable repo, fresh OSS video stack from pontostroy
* slim RazorQt (default) and E17 desktop environments from their respective repos
* LeechCraft modular system as a foundation for your basic-needs software kit
* fresh Mozilla Firefox browser and Thunderbird e-mail client for your web-surfing needs
* Clementine audio player, VLC and S/Mplayer video players for your multimedia needs
* LibreOffice, Calibre and GIMP for your documentational needs
* Tor and Polipo for your anti-censorship needs
* zsh, kmscon, nmap, cnetworkmanager and other various console & networking tools
* gparted, testdisk, snapper, disktype and other filesystem tools
* exfat and zfs kernel modules
* bunch of useful repos pre-configured for games, emulators and recent, mostly stable updates

It does NOT provide:
--------------------
— proprietary video drivers (because they suck and are pain in the ass) and video driver support for anything without KMS, for that matter
— KDE or Gnome pre-installed (because of how fat the former and how ugly the later are)
— any language packages (for space conservation). add your language in yast after installation
— Wayland packages (because it's too raw yet)
— printer and scaner support (because would require a lot of packages without much use on generic installation media)
— cd/dvd/bluray and whatever disk rom utilities (because spinning media must die)
— accessibility features (because i have no idea how to setup them right)

I recommend to use smart SATA boxes with legacy (floppy, disk, virtual partition) emulation like  IODD / Zalman ZM-* (www.iodd.co.kr / http://www.zalman.com/global/product/CategorySecond_Pic.php) series as the replacement for disks and usb drives in OS installation & maintenance purposes.

!Notes:
-------
⊙ Firefox is set up to use Tor by default. you can change that in its proxy settings or use Leechcraft's own webkit browser
⊙ yakuake, bluedevil, okular and dolphin KDE apps are included for the lack of adequate analogues
⊙ there is also nm-applet from Gnome for the lack _of any_ analogues (_the only_ alternative is plasma-nm and it's plasma plugin, thus not available outside of KDE)
