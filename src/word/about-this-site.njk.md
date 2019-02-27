---
title: 'This Site: The Making Of'
date: 2019 02 18
tags: word,geek,web,dev
code: true
---

## The Tech Behind This Site

This site has been around for a while. The old version used PHP along with a MySQL database for storing comments and ratings of the artwork.

I've been reading about Static Site Generation (SSG) and decided I wanted to learn more about it by doing. My personal portfolio site was due a rebuild and this would present a good training ground. With no deadlines I'd be able to take my time, go the slow way around and learn as much as possible along the way.


After researching and having a play around with [Hugo](https://gohugo.io) (written in *Go*) and [Jekyll](https://jekyllrb.com) (*Ruby*) I ended up deciding on [Metalsmith](https://metalsmith.io) (for *JS/Node*). Metalsmith is extremely modular &ndash; the base system is only 3-400 lines of code and intentionally has very limited functionality &ndash; it just takes files from a source folder and pipes them into a build folder. Everything else is done with plugins.


## Metalsmith Plugins

Each plugin does one specific, encapsulated job. They work in a pipeline sequence: the source files are piped from one plugin to the next, transforming their contents as they go along.

The pipeline for this site ended up being quite long &ndash; there's more functionality than may be apparent and as mentioned each plugin only has one simple job to do. Despite the length I'm going to detail them here because if you're trying to learn about Metalsmith it might be useful.

The list below is based on the console output from a typical build at the time of writing. It'll probably have changed a little since then but the gist will be similar. I'm using a plugin called `metalsmith-timer` which times each step of the process and prints a label when its complete (this can be used to help with optimisation).


### Timings

I've included the timings for each step below. It's important to note that my mid-winter development machine is a 5-year-old Android tablet running Debian in a chroot (it's surprisingly adept and I talk about it [here](/word/low-power-computing/)). It's not the fastest machine so the build times are a lot slower than they'd be on a more capable workstation. A full build on my tablet including image processing tends to take 5-6 minutes in total (vs 1 min on Netlify).

**Due to my slow machine and based on the Netlify build times you can probably presume the timings listed here are about 5x slower than what you'd experience on a decent modern workstation.**

I also have a couple of specific build jobs defined, one which only recompiles CSS from SASS and another which builds the entire site but doesn't do the image processing. The latter is the job I use the most during development as I don't often need to add new images.


+ `... initialised +0ms`

  This is the start of the process (t=0) although actually all the source files have been read into memory at this point so a small amount of time has passed.


+ `... images processed +3m`

  A fair amount of image processing is done here, using `metalsmith-sharp` (a wrapper for the very fast [sharp](https://sharp.dimens.io/en/stable/) image manipulation library).
  - A high resolution image of each artwork is included in the source files. We create a medium-sized copy to be used as the main image and a small copy to be used as a thumbnail. The hi-res version is used in the image magnifier.
  - All images within blog posts are duplicated a couple of times at different size and renamed so that they can be used in srcset markup and the browser can choose to download the best size for whatever device the site is being viewed on.


+ `... SASS compiled +325ms`

  CSS is stored in several separate files so that things like colours, sizes, animations and functions (mixins) can be kept apart. SASS (via the `metalsmith-sass` plugin) is used to compile them into a single compressed CSS file so as to keep file size and HTTP requests down to a minimum


+ `... JSON imported +12ms`

  A few bits of useful data (markup metadata and some useful strings) are stored in separate files. Here `metalsmith-data` is used to bring them into metalsmith so that they can be used while building pages.


+ `... files created from JSON +146ms`

  Data describing all of the artworks are contained in JSON files. Using the `metalsmith-json-to-files` plugin, the JSON is parsed and an individual page is created from each item. The plugin is already great and I patched it to be even more useful in my specific case. By default all imported data comes into the created pages wrapped in a `data` object. This was clashing with another `data` brought in by a different plugin (`metalsmith-data`) so my patch allowed me to rename `data` to `itemData`.

  I later found that the tags I had in my JSON data for each artwork were inaccessible to other plugins because of being buried inside that outer `data`/`itemData` wrapper, so I created another patch which allowed me to select bits of data to be injected directly into the page without the outer wrapper. This meant that other plugins (eg. `metalsmith-tags`) could access the data and *bingo*.


+ `... markdown converted +276ms`

  I use [markdown](https://en.wikipedia.org/wiki/Markdown) to create blog posts as it's simple, clean and can be written in any text editor. I want to blog more and removing as many barriers as possible means I'm more likely to get stuff written rather than procrastinating. `metalsmith-markdown` is used here to convert my &ast;.md markdown files into html.


+ `... posts slugged and renamed +162ms`

  The markdown files have been turned into pages and as part of that process they've been endowed with proper titles. In this step those titles are used to create friendly URL slugs and in turn the files are renamed to match those slugs.


+ `... excerpts grabbed +512ms`

  `metalsmith-excerpts` is used to automatically create an excerpt for each post (it basically just grabs the first paragraph tag it finds in the markup).


+ `... drafts ignored +4ms`

  To create a draft post I can just include `draft: true` in the file's [front matter](https://jekyllrb.com/docs/front-matter/), then the `metalsmith-drafts` plugin can tell metalsmith to ignore those files during build.


+ `... permalinked POSTS +33ms`

  The posts were created with paths such as `/word/post-number-one.html`. Here a plugin called `metalsmith-permalinks` is used to change those paths to things like `/word/post-number-one/index.html`. This means friendlier URLs (`/word/post-number-one/`) can be used as the server will default to serving the index page from that folder.

  `/word/post-number-one.html` ->
  `/word/post-number-one/index.html` ->
  `/word/post-number-one/`


+ `... collections created +952ms`

  It's useful to be able to work with the concept of collections, for example this site has word, art and photo collections. This enables us to do things like easily providing previous/next links for navigation. `metalsmith-collections` allows collections to be defined based on the contents of chosen subdirectories, eg. all pages inside the 'art' directory get added to `collections.art`.


+ `... metadata boilerplate added to posts +5ms`

  Every post I wrote required me to add some metadata (`layout: 'post.njk'`) in the front matter to properly integrate it into the site. I didn't want to have to remember to include this every time. The `metalsmith-metadata` plugin lets me automatically add this (or any other) data to every item in the `word` collection (ie. blog posts).


+ `... tag cloud analysed/created +19ms`

  `metalsmith-word-cloud` is a plugin which analyses all the collections in the site and creates data that can be used to build a tag cloud.

  I decided to try using a tag cloud as the main navigation for the site. For it to work I'm going to restrict the number of tags I use so that it doesn't become too unwieldy. It's an experiment, an indulgance I don't mind trying on my personal site. There's quite a lot of content on this site and while this unconventional nav might make it a little harder to find a specific artwork, I'm not sure that many visitors will be wanting to exercise that use-case. The tag cloud does lend itself to discoverability of new, related items though, and this is something I want to push.


+ `... topic pages created from tags +167ms`

  Every blog post and artwork has been tagged during the editing process. Here that info is used to compile a page for each tag, listing every item which includes the respective tag. `metalsmith-tags` is the plugin that does the work.


+ `... permalinked TOPICS +59ms`

  Permalinks (as described above) are created for the topic pages that were just made. It may seem strange that I'm using the permalinks plugin twice &ndash; why not just do it all in one go? The reason for this is that the items listed on the topic pages should link to their permalink URLs, so all of the blog posts and artwork pages need to have been permalinked already in order for those permalinks to exist. But then once the topic pages exist (including the adjusted, permalink URLs) those topic pages themselves should have nice friendly permalink URLs.


+ `... dates formatted +171ms`

  Dates have been written into the site data in specific formats. Here `metalsmith-date-formatter` is used to convert those dates into various formats for use in the created pages... for example artwork listings only show the year of creation whereas blog posts show the exact day. This is a purely stylistic choice &ndash; the exact date is actually included in the JSON data describing the artworks and I may decide to show it differently at some point. Of course there are various ways in which I could have extracted a year from a date but using a plugin feels more "correct" for metalsmith.
`metalsmith-date-formatter` is a very useful plugin but I desired a bit more functionality &ndash; I wanted to be able to created various output styles from a single input date. So I patched the plugin to add this funtionality.


+ `... templates inherited +16s`

  This is one of the most crucial steps and brings up a very important concept in static site generation. Templating engines allow bits of pages to be re-used throughout a site &ndash; obvious examples might be headers and footers. They also allow data to be injected into the templates and processed in various ways using filters (eg. to convert a date from one format to another). Blocks can be defined and replaced in child pages. The concept of inheritance helps with modularisation and re-use. It's all very powerful, lovely stuff to work with.

  I'm using [Nunjucks](https://mozilla.github.io/nunjucks/), a templating engine from Mozilla which is based on another engine called [jinja2](http://jinja.pocoo.org/). `metalsmith-layouts` is the plugin which instigates the templating engine. Although I chose Nunjucks, `metalsmith-layouts` can also be used with other engines such as Handlebars.


+ `... markup beautified +8s`

  Some would consider this an unneccesary step &ndash; running the outputted markup through a prettifier to keep indentation and whitespace nice and neat. `metalsmith-beautify` does the job. I find genuine benefits in working with clearly formatted code. It's easier to read and debug &ndash; sometimes when I'm using my Android dev machine I just view-source in the browser (you can prefix any url with `view-source:` to do this in Chrome and Brave on Android). I am able to open full Chromium and access developer tools when I need to via Linux Deploy and XSDL server, it works very well but is a little slow on this old tablet. At some points during the development process viewing the markup is good enough.

  I might not have taken this step if it placed any burden on the client or server, but the only cost is for me to bear, during the build process... for 8 seconds. Technically a few bytes of whitespace are added to the markup vs a compacted page, but I'm serving this up over the brilliant Netlify and their excellent Content Delivery Network, I really think it's fair to say that it *doesn't matter*. In this instance, the comforting feeling I get when I view source and see lovely nesting and whitespace is worth it.


+ `... RSS feed created +360ms`

  `metalsmith-feed` is used here to automate creation of an RSS feed of all the site's main content. It's another thing which some people find outdated or redundant but there is a niche of users who love consuming their content via RSS. When accomodating those users is as simple as one-time installation and configuration of a plugin I'm going to do that.


+ `... sitemap.xml created +497ms`

  It's good to have a sitemap for web crawlers and SEO. Well worth the half a second `metalsmith-sitemap` adds to the build process.


+ `... links checked +17s`

  By running the `metalsmith-linkcheck` plugin, all internal and external links are tested and any failures listed and output into a file.


## Netlify
