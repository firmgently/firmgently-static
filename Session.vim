let SessionLoad = 1
if &cp | set nocp | endif
let s:so_save = &so | let s:siso_save = &siso | set so=0 siso=0
let v:this_session=expand("<sfile>:p")
silent only
silent tabonly
cd ~/000-WORK-TERMUX/firmgently-static
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
set shortmess=aoO
badd +3 src/art.njk
badd +46 src/index.njk
badd +6 src/objects.njk
badd +6 src/photos.njk
badd +6 src/web.njk
badd +6 layouts/fg-template.njk
badd +0 layouts/gf-template.njk
badd +25 layouts/item.njk
badd +15 layouts/itemList.njk
badd +52 layouts/template.njk
badd +73 build.js
badd +12 package.json
badd +7 src/JSONToFiles
badd +7 layouts/partials/stuff.njk
badd +17 TODO
badd +41 layouts/post.njk
badd +9 src/words/post1.njk.md
badd +11 src/words.njk
argglobal
silent! argdel *
$argadd src/art.njk
$argadd src/index.njk
$argadd src/objects.njk
$argadd src/photos.njk
$argadd src/web.njk
$argadd layouts/fg-template.njk
$argadd layouts/gf-template.njk
$argadd layouts/item.njk
$argadd layouts/itemList.njk
$argadd layouts/template.njk
$argadd build.js
$argadd package.json
edit src/words/post1.njk.md
set splitbelow splitright
set nosplitbelow
set nosplitright
wincmd t
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
argglobal
if bufexists('src/words/post1.njk.md') | buffer src/words/post1.njk.md | else | edit src/words/post1.njk.md | endif
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let s:l = 9 - ((8 * winheight(0) + 16) / 32)
if s:l < 1 | let s:l = 1 | endif
exe s:l
normal! zt
9
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
nohlsearch
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
