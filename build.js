/*jslint es6 */

/*
 * Metalsmith build file
 * Build site with `npm start`
 */

'use strict';

const metalsmith = require('metalsmith'); // static site generator
const debug = require('metalsmith-debug'); // debugging
const markdown = require('metalsmith-markdown'); // convert markdown
const marked = require('marked'); // helps create custom md renderer
const layouts = require('metalsmith-layouts'); // templating (using Nunjucks here)
const beautify = require('metalsmith-beautify'); // format outputted markup
const data = require('metalsmith-data'); // import JSON data
const collections = require('metalsmith-collections'); // groups files together into collections
const metadata = require('metalsmith-collection-metadata'); // add some defaults to collections
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
const date_formatter = require('metalsmith-date-formatter'); // convert date formats for display



// metalsmith-markdown uses `marked` internally
// get an instance of its renderer so we can customise it
// to convert markdown images into figure/captions
var markdownRenderer = new marked.Renderer();
markdownRenderer.image = function (href, title, text) {
	var suffix_ar = [ "_100w", "_500w", "_1000w" ],
	dotIndex = href.lastIndexOf("."),
	p1 = href.substr(0, dotIndex),
	p2 = href.substr(dotIndex),
	src_ar = [], i, markup;

	for (i = 0; i < suffix_ar.length; i++) {
		src_ar[i] = p1 + suffix_ar[i] + p2;
	}

	if (text) {
		markup = `<figure>
			<img src="${href}" alt="${text}" title="${title}"
				srcset="${src_ar[0]} 100w, ${src_ar[1]} 500w, ${src_ar[2]} 1000w"
				sizes="(min-width: 900px) 1000px,
					(max-width: 900px) and (min-width: 400px) 50em,
					( not (orientation: portrait) ) 300px,
					( (orientation: landscape) or (min-width: 1000px) ) 50vw, 
					100vw">
			<figcaption>
				<p>${title}</p>
			</figcaption>
		</figure>`;
	} else {
		markup = `<img src="${href}" alt="${text}"
			srcset="${src_ar[0]} 100w, ${src_ar[1]} 500w, ${src_ar[2]} 1000w"
			sizes="(min-width: 900px) 1000px,
				(max-width: 900px) and (min-width: 400px) 50em,
				( not (orientation: portrait) ) 300px,
				( (orientation: landscape) or (min-width: 1000px) ) 50vw, 
				100vw">`;
	}
	return markup;
};


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
  .clean(clean)
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
  .use(timer('images processed'))

  .use(sass({
    includePaths: ['css']
  }))
  .use(timer('SASS compiled'))

// import JSON
// creates data.config, data.items etc
  .use(data({
    config: './data/config.json',
    stuckism: './data/stuckism.json'
  }))
  .use(timer('JSON imported'))

// create files from JSON (eg. art/cat/index.html)
// although using some of the same JSON files as metalsmith-data (above),
// this is a separate unrelated plugin
  .use(json_to_files({ source_path: './data/' }))
// remove redundant file left over by json_to_files
  .use(move_remove({ remove: [/json-to-files*/] }))
  .use(timer('files created from JSON'))

	.use(markdown({
		renderer: markdownRenderer,
		headerIds: false // IMPORTANT essential otherwise build fails
	}))
	.use(timer('markdown converted'))

// rename markdown posts according to title
  .use(slug({
    pattern: ['words/*.html'],
    property: 'title',
    mode: 'rfc3986',
    renameFiles: true
  }))
  .use(timer('posts slugged and renamed'))

//
  .use(excerpts())
  .use(timer("excerpts grabbed"))

// web.html => web/index.html
  .use(permalinks({
		relative: false,
    linksets: [{
			match: { collection: 'words' },
			pattern: 'words/:title'
    }]
	}))
  .use(timer('permalinked * posts *'))

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
    words: 'words/*/*.html',
    art: 'art/*/*.html',
    photos: 'photos/*/*.html',
    objects: 'objects/*/*.html',
    web: 'web/*/*.html'
  }))
  .use(timer('collections created'))

	//
  .use(metadata({
    'collections.words': {
      layout: 'post.njk'
    }
  }))
  .use(timer('metadata added to posts'))

// I'd have expected that `wordcloud` would need to come after `tags`
// in the pipeline as it uses the tags. I was wrong.`tags` turns the
// comma separated string of tags that `wordcloud` needs into an array
// of objects containing a name and slug for each tag.
  .use(wordcloud({
    category: 'tags', // optional, default is tags
    reverse: false, // optional sort value on category, default is false
    path: '/' + topicDir // <- Notice that path is prefixed with slash for absolute path 
  }))
  .use(timer("tag cloud analysed/created"))

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
  .use(timer("topic pages created from tags"))
  .use(permalinks({
		relative: false,
    linksets: [{
			match: topicDir + '/*',
			pattern: topicDir + '/:title'
    }]
	}))
  .use(timer('permalinked * topics *'))

	.use(date_formatter({
		dates: [
			{
				key: 'date',
				format: 'MMMM DD, YYYY'
			}, {
				key: 'year',
				format: 'YYYY'
			}
		]
	}))

// fill in Nunjucks templates
// ??? processes template inheritance ???
  .use(layouts({ 
    pattern: ['**/*.html'],
    engine: 'nunjucks',
    default: 'template.njk',
    suppressNoFilesError: true, // as we're using changed()
    engineOptions: engineOptions
  }))
  .use(timer('templates inherited'))

// tidy up outputted markup
  .use(beautify({
    indent_size: 2,
    indent_char: " ",
    max_preserve_newlines: 0,
    extra_liners: '[head,body,/body,/html,header,section,footer]'
  }))
  .use(timer('markup beautified'))

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

