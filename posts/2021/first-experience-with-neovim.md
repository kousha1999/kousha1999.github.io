## My First Experience with Neovim

### Installation

I'm a Vim user but, I love to try new things and this time, I tried Neovim.
Installation is so easy, I'm an Arch Linux user so it is easy as enter below command.

`sudo pacman -S neovim` 

You can check the [Neovim Github](https://github.com/neovim/neovim/wiki/Installing-Neovim) for installation steps.

When completed, you can run Neovim by `nvim` command.

![](../images/neovim-01.png)

As you can see it is so lightweight and a simple colorscheme. I want to install some plugins to make it more fasion.

### Installing vim-plug

First of all, I going to install [vim-plug](https://github.com/junegunn/vim-plug) which make easier plugin installation process.

You can simply install it with below command:

`sh -c 'curl -fLo "${XDG_DATA_HOME:-$HOME/.local/share}"/nvim/site/autoload/plug.vim --create-dirs \
    https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim'`

Now we need to enable this plugin, Open `~/.config/nvim/init.vim` file (create if it isn't exist), Insert below configuration into file:

```Mardown
call plug#begin('~/.config/nvim/plugged')

call plug#end()
```

**~/.config/nvim/plugged**: Installed Plugin will goes here. (create it if it does'nt exist)

Between these 2 calls, We can handle our plugins to install/remove/....

### Installing Dracula Colorscheme

I want to install **Dracula** theme so I use `Plug ''` to install **Dracula** theme, I add `Plug ''` between 2 `#call` block:

```markdown
#call plug#begin('~/.config/nvim/plugged')
Plug 'dracula/vim',{'as':'dracula'}
#call plug#end()
```

**dracula/vim**: it's username+/+repository_name (https://github.com/dracula/vim).

**{'as':'dracula'}**: it gives a short name to that theme/plugin.

Then open neovim by `nvim` command then use below command in **command mode**:

`:PlugInstall`

It will install all plugin that is listed in `#call` block. I've added some more plugins to install.

![](../images/neovim-3.png)

### Enable Plugin/Colorscheme
After all, now we need to enable colorscheme, to make this happen just add `colorscheme [name of colorscheme]` to **init.vim** file. Also it is recommended to use `set termguicolors` before choose a colorscheme.

```markdown
set termguicolors
call plug#begin('~/.config/nvim/plugged')
                                                                               
Plug 'kyazdani42/blue-moon'
Plug 'cocopon/iceberg.vim'
Plug 'itchyny/lightline.vim'
Plug 'dracula/vim',{'as':'dracula'}
Plug 'Badacadabra/vim-archery'

call plug#end()

colorscheme dracula
```

If you want to change colorscheme for example to archery, just change `colorscheme` value to archery.

```markdown
set termguicolors
call plug#begin('~/.config/nvim/plugged')
                                                                               
Plug 'kyazdani42/blue-moon'
Plug 'cocopon/iceberg.vim'
Plug 'itchyny/lightline.vim'
Plug 'dracula/vim',{'as':'dracula'}
Plug 'Badacadabra/vim-archery'

call plug#end()

colorscheme archery
```

### Remove Plugin/Colorscheme

To remove a plugin, just remove the `Plug ''` for that plugin and then run `nvim`, then enter `:PlugClean` in command mode of nvim.

