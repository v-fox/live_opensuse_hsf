Hackeurs Sans Frontières
========================
### download built images at [SourceForge](https://sourceforge.net/p/hackeurs-sans-frontieres), forums are there too
This is hybrid live cd/usb openSUSE spin aimed to be fully functional out-of-the-box yet slim desktop system for advanced users in countries without software patent racket.  
It DOES NOT guarantee best security defaults, so users with sensitive needs are advised to direct their attention to something like [TAILS](https://tails.boum.org), however it should be quite adequate as an installation basis for everyday use.

I recommend using smart SATA boxes and usb drives with legacy (floppy / CD / virtual partition) emulation as the replacement for disks, like:  
* ⊘ [IODD](https://iodd.co.kr) / [Zalman ZM-\*](https://www.zalman.com/global/product/CategorySecond_Pic.php) series
* ⊘ [The IsoStick](https://isostick.com)
* ⊘ or just using it on any fast USB stick

It provides:
------------
* fresh Stable kernel from Kernel:stable repo
* fresh (default) or bleeding edge OSS video stack from X11 repo (rc's) and pontostroy (git & kernel rc's)
* codecs, font antialiasing and texture compression support without artificial restrictions
* slim LXQt (default) and Enlightenment desktop environments from their respective repos
* international collection of fonts and universal iBus input method by default
* LeechCraft modular system stripped for only IM, Socializing and P2P functionality
* fresh Mozilla Firefox browser and Thunderbird e-mail client
* Clementine audio player, VLC and S/Mplayer video players
* LibreOffice, Calibre, pdfcrack and GIMP
* mc, zsh, kmscon, android-tools, wgetpaste/pastebinit and other various console tools
* anti-censorship kit: Tor, Polipo, dnscrypt-proxy, proxychains and miredo-client
* networking: ze/nmap, hostapd, usbip, nping, iptraf-ng, upnp-inspector, mtr, lft, minicom, rancid, aria2, aMule, irssi and a bunch
* gparted, gptfdisk-fixparts, guestfs-tools, testdisk, snapper, disktype and other filesystem tools
* exfat and zfs kernel modules and general FS management & recovery tools like fsarchiver, ddrescue, testdisk, photorec, ext4magic
* autopsy/sleuthkit, scalpel, chkrootkit, ntpassw/dchntpw, lynis, aircrack-ng, kismet, reaver and more security tools
* {real/true}crypt, aespipe, emount/cryptsetup, seahorse/gnome-keyring, keepassx encryption utilities
* bunch of useful repos pre-configured for games, emulators and recent but mostly stable updates

It does NOT provide:
--------------------
— proprietary video drivers (because they suck and are pain in the ass), and video driver support for anything without KMS for that matter  
— whole KDE or Gnome pre-installed (because of how fat the former and how ugly the later are)  
— any language packages (for space conservation)  
— Wayland packages (because it's too raw yet)  
— printer and scaner support (because that would require a lot of packages without much use on generic installation media)  
— many cd/dvd/bluray and whatever disk rom utilities (because spinning media must die). mkisofs, cdrecord and acetoneiso2 are included though  
— accessibility features (because i have no idea how to setup them right)  

Notes:
------
⊙  **the first thing you should do on freshly loaded system is to look at gnote's HSF note**  
⊙ use `locate` to search for files fast and `apropos` to search for commands based on their manual's description  
⊙ Firefox and Thunderbird are set up to use Tor by default, *_proxy variables are also globally set, DNS queries are encrypted and funneled to OpenDNS by default  
⊙ popular Microsoft fonts are included for web & document compatibility. they may be removed in future  
⊙ Bitcoin support is wanted but Qt5 dependency of official client makes it unfeasible for now  

⊙ can be put on flash USB sticks and such from within itself by  
* simple `dd bs=<your flash's write block size, like 64K> if=<image or even cdrom device that you have booted it on> of=/dev/<target_device>`
* or glamorous GUI tool like `unetbootin` (included), SUSE's `imagewriter` or Ubuntu's `win32diskimager`

⊙ DE-specific apps are included for the lack of adequate analogues  
* KDE:  
  * krusader (dolphin + konqueror + mc in one package and more ? yes, please)  
  * bluedevil (bluez control)  
  * yakuake (handy console), will be replaced with qterminal once it matures  
  * kate (great simple editor)  
  * okular (useful doc viewer, integrated in Firefox via kparts-plugin)  
  * kchmviewer (MS chm viewer), because sometimes okular screws up  
  * gwenview + kipi-plugins (highly-capable image viewer)  
* GNOME:  
  * nm-applet (this is _the only_ NM GUI that can launch in any DE)  
  * gparted (The F/OSS disk editor), even though it can be substituted with YaST  
  * pavucontrol (PulseAudio control) and paprefs (PA network configurator)  
  * ekiga (The SIP & H.323 client)  
  * easytag (The audio file tag editor)  
  * seahorse (gpg GUI)  
  * gcr-viewer (crypto file viewer)  

Building:
---------
* ∀ every build comes with its building source in '/home/hacker/Hackeurs Sans Frontières - build code - ${VERSION_CONFIG}_${BUILD_DATE}.tar.xz'
* ∀ you can build your own image by:
 	1. using openSUSE
 	2. having "kiwi" and "kiwi-desc-isoboot" packages installed
 	3. editing files, starting from 'source/*' and 'create_appliance.sh'. or not
 	4. running `create_appliance.sh`
 	5. waiting quite a bit

* ∀ the process of development for this project is like this:
 	01. _future_ release version is set in 'source/version'
 	02. desired changes are made and package lists are sorted via `config/sort.sh`
 	03. `git commit` issued
 	04. image is build via `create_appliance.sh`
 	05. image is booted on real hardware and tested, maybe in virtual hardware also
 	06. bugs and insufficiencies are noted/reported/filed
 	07. fixes made
 	08. new image is tested and steps 6-7-8 are repeated until condition is satisfactory
 	09. the image that deemed satisfactory is considered as current release, `git tag -a` is issued with "future", now current, version
 	10. everything is repeated
