I'm a GNU/Linux user and I had Arch/Fedora/... distributions for a while. I was passionate about BSDs specially FreeBSD.
It has a devil-like logo (Beastie :)) which is cute and I like it.
So I decided to share my experience when I installed it on my laptop as main OS.

After installation I had a Terminal which is not good idea to use when you're using it as your daily OS, which made me to insall a GUI.
We need root user to do these stuff so instead `su` command I preffer to use `sudo`, so I installed it first.

### Sudo
1. `root# pkg install sudo`
2. `root# visudo`
3. add `invoxes ALL=(ALL) ALL`
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

### Portmaster
`sudo pkg install portmaster`

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
`sudo openconnect --user=invoxes [VPN Address]`

### Intel Grapric Driver
If you did what [How to setup FreeBSD with a riced desktop | unixsheikh](https://unixsheikh.com/tutorials/how-to-setup-freebsd-with-a-riced-desktop-part-3-i3.html) did, you already installed it. :)
1. `sudo pkg install drm-kmod`
2. add `kld_list="/boot/modules/i915kms.ko"` in /etc/rc.conf
3. `sudo pw groupmod video -m [username]`
4. reboot system and check i915kms is loaded or not (by `kldstat`)
