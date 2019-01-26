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
const rename = require('metalsmith-rename'); // rename outputted files
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

// JSON contains pieces of work with `type` properties
// (WEB / PHOTO / ART etc). This function returns a filtered
// list to be used on eg. the art index page
const filterItemsByType = function(items, type) {
  return items.filter(function(item) {
    return item.type === type;
  });
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
		stripIndexFromPath: stripIndexFromPath,
		filterItemsByType: filterItemsByType,
		averageReadTime: averageReadTime,
		spaceToDash: spaceToDash
	}
};

metalsmith(__dirname)
	.use(timer('begin'))
	.ignore([
		'**/src/images/**',
		'**/src/css/**'
	])
	.clean(true)
	.source('./src/')
	.destination('./build/')
	.use(timer('initialised')) // timer measures build process

  // import JSON
  // creates data.config, data.items etc
  .use(data({
		config: './data/config.json',
		stuckism: './data/stuckism.json',
		items: './data/items.json'
	}))
  .use(timer('data (JSON imported)'))

  // create files from JSON (eg. art/cat/index.html)
  // although using some of the same JSON files as metalsmith-data (above),
  // this is a separate unrelated plugin
  .use(json_to_files({ source_path: './data/' }))
  .use(timer('JSON to files'))
  // remove redundant file left over by json_to_files
  .use(move_remove({ remove: [/JSONToFiles/] }))

  // process markdown
  .use(inplace({ 
    pattern: ['**/*.md*'],
		engine: 'markdown',
		engineOptions: engineOptions
	}))
  .use(timer('converted markdown'))

  // rename markdown posts according to title
  .use(slug({
    pattern: ['words/*.html'],
    property: 'title',
    mode: 'rfc3986',
    renameFiles: true
  })).use(timer('slug'))
  // words/post-title.html => words/post-title/index.html
  .use(permalinks({ pattern: ':title' })).use(timer('permalinks (posts)'))
  // permalinks here leaves a load of redundant '.njk' files, remove them
  .use(move_remove({ remove: [/\/.njk/] }))

  // create collection lists
  .use(collections({
    all: [
			'art/*/*.html',
			'photos/*/*.html',
			'objects/*/*.html',
			'web/*/*.html'
		],
		words: '', // add posts to this collection with metadata `collection: words`
		art: 'art/*/*.html',
		photos: 'photos/*/*.html',
		objects: 'objects/*/*.html',
		web: 'web/*/*.html'
	})).use(timer('created collections'))

  // convert njk to html
  // ??? processes internal template syntax ???
  .use(inplace({ 
    pattern: ['**/*.njk'],
		engine: 'nunjucks',
		default: 'template.njk',
		engineOptions: engineOptions
	})).use(timer('convert njk to html'))

  // analyse tags and create tag pages
  .use(tags({
    handle: 'tags', // yaml key for tag list in you pages
    path:'topics/:tag.html', // path for result pages
    layout:'topic.njk',
    sortBy: 'date',
    reverse: true,
    skipMetadata: false, // skip updating metalsmith's metadata object. useful for improving performance on large blogs
    metadataKey: "tags", // default: `tags`
    slug: {mode: 'rfc3986'}
  })).use(timer("tag analysis and tag page creation"))

  // web.html => web/index.html
  .use(permalinks({ pattern: ':title' })).use(timer('permalinks (all)'))

  //
  .use(excerpts()).use(timer("grabbed excerpts"))

  // fill in Nunjucks templates
  // ??? processes template inheritance ???
  .use(layouts({ 
    pattern: ['**/*.html'],
		engine: 'nunjucks',
		default: 'template.njk',
		engineOptions: engineOptions
	})).use(timer('Nunjucks inheritance'))

  // tidy up outputted markup
  .use(beautify()).use(timer('tidy markup'))


//  .use(rename([
//    [/\.html$/, '.htm']
//  ]))
//	.use(timer('rename'))

  //	.use(linkcheck({ verbose: true }))
  //	.use(timer('links checked'))

  .build(function (err) {
		if (err) { throw err; }
		console.log('Build finished!');
	})

