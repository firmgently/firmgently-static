# Firm Gently / Gently Firm Website

Static site built using Node.js and Metalsmith

* `npm install` to set up dependencies
* `npm start` to run the build script, which will take the files from the 'src' directory, process them, and output to the 'build' directory


# Data

* Site configuration data is stored in /data/config.json
* Item data (eg. artwork details) is stored in /data/items.json
* Written articles/blog posts are stored as individual markdown files in /src/words/


# Gotchas

* When inserting tags into YAML front matter, make sure everything is lowercase. It gets turned into URLs/slugs as-is and if the server is case-sensitive then `TAG.html` != `tag.html`

* `metalsmith-wordcloud` **must** come before `metalsmith-tags` in the pipeline as wordcloud needs to analyse the tags in their raw form ("tag1,tag2,tag3") before metalsmith-tags processes them into 
```
[
  { name: "tag1", slug: "tag1" },
  { name: "tag2", slug: "tag2" },
  { name: "tag3", slug: "tag3" },
]
```

* Got rid of metalsmith-in-place and swapped for metalsmith-markdwon

* `metalsmith-markdown` is based on `marked`. In order to turn images from markdown files into proper captioned images and add srcset, the rendered had to be overridden. `marked.Renderer` has a default property called headerIds set to `true`. This caused errors during build as it was looking for a slug to convert to a headerId and failed when it couldn't find one. So it's essential to have headerIds set to false if called at a point in the pipeline before slugs exist.
