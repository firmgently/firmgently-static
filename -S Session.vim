let SessionLoad = 1
if &cp | set nocp | endif
let s:cpo_save=&cpo
set cpo&vim
inoremap <silent> <C-F8> :RandomColorScheme
inoremap <silent> <S-F8> :PrevColorScheme
inoremap <silent> <F8> :NextColorScheme
nnoremap  :bnext
nnoremap  :bprev
nnoremap K i
xmap S <Plug>VSurround
vmap [% [%m'gv``
nmap \p <Plug>(Prettier)
vmap ]% ]%m'gv``
vmap a% [%v]%
nmap cS <Plug>CSurround
nmap cs <Plug>Csurround
nmap ds <Plug>Dsurround
vmap gx <Plug>NetrwBrowseXVis
nmap gx <Plug>NetrwBrowseX
xmap gS <Plug>VgSurround
nmap ySS <Plug>YSsurround
nmap ySs <Plug>YSsurround
nmap yss <Plug>Yssurround
nmap yS <Plug>YSurround
nmap ys <Plug>Ysurround
vnoremap <silent> <Plug>NetrwBrowseXVis :call netrw#BrowseXVis()
nnoremap <silent> <Plug>NetrwBrowseX :call netrw#BrowseX(expand((exists("g:netrw_gx")? g:netrw_gx : '<cfile>')),netrw#CheckIfRemote())
nnoremap <silent> <Plug>SurroundRepeat .
nnoremap <silent> <Plug>(PrettierCliPath) :PrettierCliPath
nnoremap <silent> <Plug>(PrettierCliVersion) :PrettierCliVersion
nnoremap <silent> <Plug>(PrettierCli) :PrettierCli
nnoremap <silent> <Plug>(PrettierVersion) :PrettierVersion
nnoremap <silent> <Plug>(PrettierAsync) :PrettierAsync
nnoremap <silent> <Plug>(Prettier) :Prettier
nnoremap <silent> <C-F8> :RandomColorScheme
nnoremap <silent> <S-F8> :PrevColorScheme
nnoremap <silent> <F8> :NextColorScheme
map <F2> :ls:b 
map <F1> :ls
noremap <Right> <Nop>
noremap <Left> <Nop>
noremap <Down> <Nop>
noremap <Up> <Nop>
imap S <Plug>ISurround
imap s <Plug>Isurround
imap  <Plug>Isurround
let &cpo=s:cpo_save
unlet s:cpo_save
set autoindent
set background=dark
set backspace=indent,eol,start
set cindent
set cinkeys=0{,0},0),:,!^F,o,O,e
set directory=~/.vim/tmp//,.,~/tmp,/var/tmp,/tmp
set expandtab
set fileencodings=ucs-bom,utf-8,default,latin1
set helplang=en
set hidden
set incsearch
set indentkeys=0{,0},:,!^F,o,O,e
set iskeyword=@,48-57,_,192-255,-
set nojoinspaces
set laststatus=2
set lazyredraw
set nomodeline
set printoptions=paper:letter
set ruler
set runtimepath=~/.vim,~/.vim/bundle/lightline.vim,~/.vim/bundle/textutil,~/.vim/bundle/tsuquyomi,~/.vim/bundle/typescript-vim,~/.vim/bundle/vim-airline,~/.vim/bundle/vim-colors-solarized,~/.vim/bundle/vim-colorscheme-switcher,~/.vim/bundle/vim-javascript,~/.vim/bundle/vim-jinja,~/.vim/bundle/vim-misc,~/.vim/bundle/vim-obsession,~/.vim/bundle/vim-prettier,~/.vim/bundle/vim-repeat,~/.vim/bundle/vim-surround,/var/lib/vim/addons,/usr/share/vim/vimfiles,/usr/share/vim/vim81,/usr/share/vim/vim81/pack/dist/opt/matchit,/usr/share/vim/vimfiles/after,/var/lib/vim/addons/after,~/.vim/bundle/vim-javascript/after,~/.vim/after
set shiftwidth=2
set showcmd
set noshowmode
set suffixes=.bak,~,.swp,.o,.info,.aux,.log,.dvi,.bbl,.blg,.brf,.cb,.ind,.idx,.ilg,.inx,.out,.toc
set tabline=%!lightline#tabline()
set tabstop=2
set ttimeoutlen=100
set undodir=~/.vim/undo
set undofile
set viminfo='100,<50,s10,h,n~/.vim/.viminfo/.viminfo
set wildmenu
set wildmode=longest:full,full
set window=54
let s:so_save = &so | let s:siso_save = &siso | set so=0 siso=0
let v:this_session=expand("<sfile>:p")
silent only
silent tabonly
cd ~/0WORK/firmgently-static
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
set shortmess=aoO
badd +1 layouts/fg-template.njk
badd +1 layouts/gf-template.njk
badd +26 layouts/index.njk
badd +1 layouts/item.njk
badd +1 layouts/post.njk
badd +142 layouts/template.njk
badd +7 layouts/topic.njk
badd +38 src/json-to-files-art
badd +504 data/items/art.json
badd +163 build.js
badd +39 src/json-to-files-objects
badd +253 src/css/_main.scss
badd +29 data/items/objects.json
badd +449 data/items/photos.json
badd +2 src/css/_sizes.scss
argglobal
silent! argdel *
$argadd layouts/fg-template.njk
$argadd layouts/gf-template.njk
$argadd layouts/index.njk
$argadd layouts/item.njk
$argadd layouts/post.njk
$argadd layouts/template.njk
$argadd layouts/topic.njk
edit src/css/_main.scss
set splitbelow splitright
set nosplitbelow
set nosplitright
wincmd t
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
argglobal
if bufexists('src/css/_main.scss') | buffer src/css/_main.scss | else | edit src/css/_main.scss | endif
setlocal keymap=
setlocal noarabic
setlocal autoindent
setlocal backupcopy=
setlocal balloonexpr=
setlocal nobinary
setlocal nobreakindent
setlocal breakindentopt=
setlocal bufhidden=
setlocal buflisted
setlocal buftype=
setlocal cindent
setlocal cinkeys=0{,0},0),:,!^F,o,O,e
setlocal cinoptions=
setlocal cinwords=if,else,while,do,for,switch
setlocal colorcolumn=
setlocal comments=s1:/*,mb:*,ex:*/,://
setlocal commentstring=//\ %s
setlocal complete=.,w,b,u,t,i
setlocal concealcursor=
setlocal conceallevel=0
setlocal completefunc=
setlocal nocopyindent
setlocal cryptmethod=
setlocal nocursorbind
setlocal nocursorcolumn
setlocal nocursorline
setlocal define=^\\s*\\%(@mixin\\|=\\)
setlocal dictionary=
setlocal nodiff
setlocal equalprg=
setlocal errorformat=
setlocal expandtab
if &filetype != 'scss'
setlocal filetype=scss
endif
setlocal fixendofline
setlocal foldcolumn=0
setlocal foldenable
setlocal foldexpr=0
setlocal foldignore=#
setlocal foldlevel=0
setlocal foldmarker={{{,}}}
setlocal foldmethod=manual
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldtext=foldtext()
setlocal formatexpr=
setlocal formatoptions=tq
setlocal formatlistpat=^\\s*\\d\\+[\\]:.)}\\t\ ]\\s*
setlocal formatprg=
setlocal grepprg=
setlocal iminsert=0
setlocal imsearch=-1
setlocal include=^\\s*@import\\s\\+\\%(url(\\)\\=[\"']\\=
setlocal includeexpr=substitute(v:fname,'\\%(.*/\\|^\\)\\zs','_','')
setlocal indentexpr=GetCSSIndent()
setlocal indentkeys=0{,0},!^F,o,O
setlocal noinfercase
setlocal iskeyword=@,48-57,_,192-255,-
setlocal keywordprg=
setlocal nolinebreak
setlocal nolisp
setlocal lispwords=
setlocal nolist
setlocal makeencoding=
setlocal makeprg=
setlocal matchpairs=(:),{:},[:]
setlocal nomodeline
setlocal modifiable
setlocal nrformats=bin,octal,hex
set number
setlocal number
setlocal numberwidth=4
setlocal omnifunc=csscomplete#CompleteCSS
setlocal path=
setlocal nopreserveindent
setlocal nopreviewwindow
setlocal quoteescape=\\
setlocal noreadonly
set relativenumber
setlocal relativenumber
setlocal norightleft
setlocal rightleftcmd=search
setlocal noscrollbind
setlocal shiftwidth=2
setlocal noshortname
setlocal signcolumn=auto
setlocal nosmartindent
setlocal softtabstop=0
setlocal nospell
setlocal spellcapcheck=[.?!]\\_[\\])'\"\	\ ]\\+
setlocal spellfile=
setlocal spelllang=en
setlocal statusline=%!airline#statusline(1)
setlocal suffixesadd=.sass,.scss,.css
setlocal swapfile
setlocal synmaxcol=3000
if &syntax != 'scss'
setlocal syntax=scss
endif
setlocal tabstop=2
setlocal tagcase=
setlocal tags=
setlocal termwinkey=
setlocal termwinscroll=10000
setlocal termwinsize=
setlocal textwidth=0
setlocal thesaurus=
setlocal undofile
setlocal undolevels=-123456
setlocal varsofttabstop=
setlocal vartabstop=
setlocal nowinfixheight
setlocal nowinfixwidth
setlocal wrap
setlocal wrapmargin=0
silent! normal! zE
let s:l = 264 - ((37 * winheight(0) + 26) / 53)
if s:l < 1 | let s:l = 1 | endif
exe s:l
normal! zt
264
normal! 0
tabnext 1
if exists('s:wipebuf') && len(win_findbuf(s:wipebuf)) == 0
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20 shortmess=filnxtToO
set winminheight=1 winminwidth=1
let s:sx = expand("<sfile>:p:r")."x.vim"
if file_readable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &so = s:so_save | let &siso = s:siso_save
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
