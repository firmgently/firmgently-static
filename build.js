/*jslint es6 */

/*
 * Metalsmith build file
 * Build site with `npm start`
 */

'use strict';

const metalsmith = require('metalsmith'); // static site generator
const debug = require('metalsmith-debug'); // debugging
const inplace = require('metalsmith-in-place'); // convert markdown
const layouts = require('metalsmith-layouts'); // templating (using Nunjucks here)
const beautify = require('metalsmith-beautify'); // format outputted markup
const data = require('metalsmith-data'); // import JSON data
const collections = require('metalsmith-collections'); // groups files together into collections
const permalinks = require('metalsmith-permalinks'); // names and locates files to match useful URL patterns
const json_to_files = require('metalsmith-json-to-files'); // create files from JSON
const timer = require('metalsmith-timer'); // for debugging, lists time between use() calls
const linkcheck = require('metalsmith-linkcheck'); // check internal/external links are still working
const slug = require('metalsmith-slug'); // rename files based on certain data
const tags = require('metalsmith-tags'); // tagging/categories for pages
const excerpts = require('metalsmith-excerpts'); // grabs first <p> from rendered page
const move_remove = require('metalsmith-move-remove'); // move/remove files
const sharp = require('metalsmith-sharp'); // image processing
const sass = require('metalsmith-sass'); // SASS compilation
const wordcloud = require('metalsmith-wordcloud'); // create wordcloud data from tags
const feed = require('metalsmith-feed'); // create RSS feed


// string-manipulation functions
const toLower = function(string) {
  return string.toLowerCase();
};
const toUpper = function(string) {
  return string.toUpperCase();
};
const spaceToDash = function(string) {
  return string.replace(/\s+/g, '-');
};

// caclulate CSS font size for tag cloud
const fontsizeFromTagWeight = function(weight, minSize, maxSize, numSizes) {
  // numSize = number of descrete sizes available -
  // can help aesthetically match various ranges of weights
  var  stepSize = (maxSize - minSize) / numSizes,
  size = minSize + (weight * stepSize);

  if (size > maxSize) { size = maxSize; }
  return size;
};

// calculate a rough estimate on time to read an article
// based on the number of words it contains
const averageReadTime = function(numWords) {
  var lowAverageWPM = 200,
    highAverageWPM = 300,
    slowMins = Math.round(numWords / lowAverageWPM),
    fastMins = Math.round(numWords / highAverageWPM),
    estimate;

  if (fastMins < 1) {
    estimate = "less than a minute";
  } else {
    estimate = fastMins + "-" + slowMins + " minutes";
  }
  return estimate;
};

// vanity function to keep the URL clean - when linking
// into a directory the index.html can be ommitted
const stripIndexFromPath = function(path) {
  // list of index files to strip -
  // include the $ to only match at the end of a string
  var indexRegExp_ar = [
    'index.html$',
    'index.htm$',
    'index.php$'
  ];
  // join all regexps into a single expression separated by |
  var regExp = new RegExp(indexRegExp_ar.join('|'), 'i');
  return path.replace(regExp, '');
};

// wrapper to save repetition when passing options
// into `use` functions
const engineOptions = {
  filters: {
    toLower: toLower,
    toUpper: toUpper,
    fontsizeFromTagWeight: fontsizeFromTagWeight,
    stripIndexFromPath: stripIndexFromPath,
    averageReadTime: averageReadTime,
    spaceToDash: spaceToDash
  }
};

// if REBUILDIMAGES then include image directory and clean build dir
// else (default) ignore image dir and don't clean build dir
var ignore_ar;
var clean;
if (process.env.REBUILDIMAGES === "true") {
  ignore_ar = [];
  clean = true;
} else {
  ignore_ar = [ '**/src/images/**' ];
  clean = false;
}

// used to name topic directory
const topicDir = "categories";


metalsmith(__dirname)
  .ignore(ignore_ar)
  .source('./src/')
  .destination('./build/')
  .clean(true)
  .metadata(
    {site: {
      title: 'Firm Gently',
      url: 'https://firmgently.co.uk',
      author: 'Mark Mayes'
    }}
  )
  .use(timer('initialised'))

// process images
  .use(sharp([
    {
      src: 'images/items/hi_res/*.jpg',
      namingPattern: 'images/items/main/{name}{ext}',
      methods: [
        { name: 'resize', args: [960, 960] },
        { name: 'resize', args: { fit: 'inside' } },
        { name: 'toFormat', args: ['jpeg'] },
        { name: 'sharpen' }
      ]
    }, {
      src: 'images/items/hi_res/*.jpg',
      namingPattern: 'images/items/thumbs/{name}{ext}',
      methods: [
        { name: 'resize', args: [300, 300] },
        { name: 'resize', args: { fit: 'inside' } },
        { name: 'toFormat', args: ['jpeg'] },
        { name: 'sharpen' }
      ]
    }, {
      src: 'images/words/**.jpg',
      namingPattern: '{dir}{name}_100w{ext}',
      methods: [
        { name: 'resize', args: [300, 300] },
        { name: 'resize', args: { fit: 'outside' } },
        { name: 'toFormat', args: ['jpeg'] },
        { name: 'sharpen' }
      ]
    }, {
      src: 'images/words/**.jpg',
      namingPattern: '{dir}{name}_500w{ext}',
      methods: [
        { name: 'resize', args: [600, 600] },
        { name: 'resize', args: { fit: 'outside' } },
        { name: 'toFormat', args: ['jpeg'] },
        { name: 'sharpen' }
      ]
    }, {
      src: 'images/words/**.jpg',
      namingPattern: '{dir}{name}_1000w{ext}',
      methods: [
        { name: 'resize', args: [900, 900] },
        { name: 'resize', args: { fit: 'outside' } },
        { name: 'toFormat', args: ['jpeg'] },
        { name: 'sharpen' }
      ]
    }
  ]))
  .use(timer('processed images'))

  .use(sass({
    includePaths: ['css']
  }))
  .use(timer('compiled SASS'))

// import JSON
// creates data.config, data.items etc
  .use(data({
    config: './data/config.json',
    stuckism: './data/stuckism.json'
  }))
  .use(timer('imported JSON data'))

// create files from JSON (eg. art/cat/index.html)
// although using some of the same JSON files as metalsmith-data (above),
// this is a separate unrelated plugin
  .use(json_to_files({ source_path: './data/' }))
// remove redundant file left over by json_to_files
  .use(move_remove({ remove: [/json-to-files*/] }))
  .use(timer('created files from JSON'))

// process markdown
  .use(inplace({ 
    pattern: ['**/*.md*'],
    engine: 'markdown',
    suppressNoFilesError: true, // as we're using clean()
    engineOptions: engineOptions
  }))
  .use(timer('converted markdown'))

// rename markdown posts according to title
  .use(slug({
    pattern: ['words/*.html'],
    property: 'title',
    mode: 'rfc3986',
    renameFiles: true
  }))
  .use(timer('made slugs for posts and renamed them'))

//
  .use(excerpts())
  .use(timer("grabbed excerpts"))

// web.html => web/index.html
  .use(permalinks({
 		pattern: ':title',
		relative: false,
    linksets: [ {
        match: { collection: 'words' },
        pattern: 'words/:title'
    } ]
	}))
  .use(timer('permalinked (all)'))

// create collection lists
  .use(collections({
    all: {
     pattern: [
      'words/*/*.html',
      'art/*/*.html',
      'photos/*/*.html',
      'objects/*/*.html',
      'web/*/*.html'
      ],
      sortBy: 'date',
      reverse: true
    },
    words: 'words/*/*.html', // posts with metadata `collection: words` will be added
    art: 'art/*/*.html',
    photos: 'photos/*/*.html',
    objects: 'objects/*/*.html',
    web: 'web/*/*.html'
  }))
  .use(timer('created collections'))

// I'd have expected that `wordcloud` would need to come after `tags`
// in the pipeline as it uses the tags. I was wrong.`tags` turns the
// comma separated string of tags that `wordcloud` needs into an array
// of objects containing a name and slug for each tag.
  .use(wordcloud({
    category: 'tags', // optional, default is tags
    reverse: false, // optional sort value on category, default is false
    path: '/' + topicDir // <- Notice that path is prefixed with slash for absolute path 
  }))
  .use(timer("created word cloud data"))

// analyse tags and create tag pages
  .use(tags({
    handle: 'tags', // yaml key for tag list in you pages
    path: topicDir + '/:tag.html', // path for result pages
    layout:'topic.njk',
    sortBy: 'date',
    reverse: true,
    skipMetadata: false, // skip updating metalsmith's metadata object. useful for improving performance on large blogs
    metadataKey: "tags", // default: `tags`
    slug: { mode: 'rfc3986' }
  }))
  .use(timer("analysed tags and created topic pages"))
  .use(permalinks({
		relative: false,
    linksets: [ {
        match: topicDir + '/*',
        pattern: topicDir + '/:title'
    } ]
	}))
  .use(timer('permalinked (all)'))

// convert njk to html
// ??? processes internal template syntax ???
  .use(inplace({ 
    pattern: ['**/*.njk'],
    engine: 'nunjucks',
    default: 'template.njk',
    suppressNoFilesError: true, // as we're using changed()
    engineOptions: engineOptions
  }))
  .use(timer('converted njk to html'))

// fill in Nunjucks templates
// ??? processes template inheritance ???
  .use(layouts({ 
    pattern: ['**/*.html'],
    engine: 'nunjucks',
    default: 'template.njk',
    suppressNoFilesError: true, // as we're using changed()
    engineOptions: engineOptions
  }))
  .use(timer('inherited templates'))

// tidy up outputted markup
  .use(beautify({
    indent_size: 2,
    indent_char: " ",
    max_preserve_newlines: 0,
    extra_liners: '[head,body,/body,/html,header,section,footer]'
  }))
  .use(timer('tidied markup'))

// RSS feed
	.use(
		feed({
			collection: 'all',
			destination: 'rss.xml',
			limit: false, // include all items
			//image_url: ,
			preprocess: file => ({
				...file,
				// Make all titles uppercase
				title: file.title || file.itemData.title,
				categories: file.tags,
				description:  (file.itemData ? file.itemData.desc : null) || file.contents
			})
		})
	)
  .use(timer('RSS feed created'))

//  .use(linkcheck({ verbose: true }))
//  .use(timer('links checked'))

  .build(function (err) {
    if (err) { throw err; }
    console.log('Build finished!');
  })

