I'm a GNU/Linux user and I had Arch/Fedora/... distributions for a while. I was passionate about BSDs especially FreeBSD. It has a devil-like logo (Beastie :)) which is cute and I like it. So I decided to share my experience when I installed it on my laptop as the main OS.

After installation, I had a Terminal which is not a good idea when you're using an OS as your daily/Personal OS, which made me install a GUI.
We need root privilege to do some kinds of stuff so instead `su` command I prefer to use `sudo`, so I installed it first.

### Sudo
1. `root# pkg install sudo`
2. `root# visudo`
3. write `invoxes ALL=(ALL) ALL` in config file
4. save and exit

Now I can use sudo whenever i need root privilege. Now I'm going to install a Window Manager (WM) and I choose i3 WM.
I've found a blog [How to setup FreeBSD with a riced desktop | unixsheikh](https://unixsheikh.com/tutorials/how-to-setup-freebsd-with-a-riced-desktop-part-3-i3.html) 
that explains how to install i3 on FreeBSD.

I have a list of various apps that I always need them like VirtualBox, OpenVPN, etc. and my installation steps below. But it is good to know you can use ports to install these.
I like **portmaster** to manage ports packages. It simply install with pkg.

I have a few things to say before I start:
Update ports packages index before using it.

Update Ports:
1. `sudo portsnap fetch`
2. `sudo portsnap extract`
3. Then update it before install any package from it by `sudo portsnap fetch update`

/etc/rc.conf vs /boot/loader.conf?
loader.conf starts during boot while rc.conf starts after boot process. So do not add a driver/service/etc. load in both of them, because it is useless. When something is loaded during boot, it is not going to load again after boot process.

## Packages Installation

### Portmaster
Install portmaster with pkg is simple.
```markdown
sudo pkg install portmaster
```
now you can install package by `portmaster` tool from ports packages.
```markdown
sudo portmaster www/nginx
```
You can remove distfiles with portmaster too.
```markdown
sudo portmaster --clean-distfiles
```

### VirtualBox
1. `sudo pkg install virtualbox-ose virtualbox-ose-additions`
2. Load `vboxdrv` Module with `kldload vboxdrv`
3. To make sure Module is always load, add `vboxdrv_load="YES"` and `vboxnet_enable="YES"` to /etc/rc.conf
4. `pw groupmod vboxusers -m yourusername`
5. `chown root:vboxusers /dev/vboxnetctl`
6. `chmod 0660 /dev/vboxnetctl`
7. add below configuration into /etc/devfs.conf
```markdown
own     vboxnetctl root:vboxusers
perm    vboxnetctl 0660
```

### OpenConnect
1. `sudo pkg install openconnect`
2. connect to vpn :)
```markdown
sudo openconnect --user=invoxes [VPN Address]
```

### Intel Grapric Driver
If you did what [How to setup FreeBSD with a riced desktop | unixsheikh](https://unixsheikh.com/tutorials/how-to-setup-freebsd-with-a-riced-desktop-part-3-i3.html) did, you already installed it. :)
1. `sudo pkg install drm-kmod`
2. add `kld_list="/boot/modules/i915kms.ko"` in /etc/rc.conf
3. `sudo pw groupmod video -m [username]`
4. reboot system and check i915kms is loaded or not (by `kldstat`)

## Configurations

Touchpad:
There are 3 different driver for trackpad. I didn't try all of them but here is a [Reddit Post](https://www.reddit.com/r/linuxquestions/comments/904gdq/libinput_vs_synaptics_vs_mtrack_whats_your) which some experiences are shared by other guys. I use `libinput`, if you want to use `libinput` too, just follow my steps.

1. create `/usr/local/etc/X11/xorg.conf.d/90-touchpad.conf`
2. Write Config.
```markdown
Section "InputClass"
	Identifier "touchpad"
	MatchIsTouchpad "on"
	Driver "libinput"
	Option "Tapping" "on"
EndSection
```

## challenge with External Hard Drive :))
I have an External Hard Drive and my backups and files are stored in that. I connected it to my laptop but FreeBSD didn't recognized it.
I've used `ls` to check External Hard Drive is detected or not and it was detected.

`ls -l /dev/da*`

Then I used gpart to see my External Hard Drive details.

Command:
```markdown
gpart show /dev/da0
```
Output:
```markdown
=>        63  3907029105  da0  MBR  (1.8T)
          63  3907024002    1  ntfs  (1.8T)
  3907024065        5103       - free -  (2.5M)
```
Everything was ok.
Before mount, We must load `fusefs` module by `kldload fusefs` command. Make sure it is loaded by `kldstat | grep fuse` command.

It is obvious if you want load it everytime, use rc.conf file.
It was detected as `NTFS` so I tried to mount with below command:
```markdown
sudo mount -t ntfs-3g /dev/da0s1 /mnt
```
but it failed!

To determine what kind of File System really is, I used `fstyp` command.

Command:
```markdown
sudo fstyp /dev/da0s1
```
Output:
```markdown
exfat
```
Yep! It is `exfat`. Now I could mount it with below command:
```markdown
sudo mount.exfat-fuse /dev/da0s1 /mnt
```
Now it worked! You can check it by `ls -l /mnt` command.
