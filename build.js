/*jslint es6 */

/*
 * Metalsmith build file
 * Build site with `npm start`
 */

'use strict';

const metalsmith = require('metalsmith'); // static site generator
const inplace = require('metalsmith-in-place'); // covnert markdown
const layouts = require('metalsmith-layouts'); // templating (using Nunjucks here)
const beautify = require('metalsmith-beautify'); // format outputted markup
const rename = require('metalsmith-rename'); // rename outputted files
const data = require('metalsmith-data'); // import JSON data
const collections = require('metalsmith-collections'); // groups files together into collections
const permalinks = require('metalsmith-permalinks'); // names and locates files to match useful URL patterns
const json_to_files = require('metalsmith-json-to-files'); // create files from JSON
const timer = require('metalsmith-timer'); // for debugging, lists time between use() calls
const linkcheck = require('metalsmith-linkcheck'); // check internal/external links are still working
 
 // string-manipulation functions
const toLower = function(string) {
	return string.toLowerCase();
};
const toUpper = function(string) {
	return string.toUpperCase();
};
const spaceToDash = function(string) {
	return string.replace(/\s+/g, "-");
};

// JSON contains pieces of work with `type` properties
// (WEB / PHOTO / ART etc). This function returns a filtered
// list to be used on eg. the art index page
const filterItemsByType = function(items, type) {
  return items.filter(function(item) {
    return item.type === type;
  });
};

// wrapper to save repetition when passing options
// into `use` functions
const engineOptions = {
	filters: {
		toLower: toLower,
		toUpper: toUpper,
		filterItemsByType: filterItemsByType,
		spaceToDash: spaceToDash
	}
};

metalsmith(__dirname)
	.ignore([
		'**/src/images/**',
		'**/src/css/**'
	])
	.clean(true)
	.source('./src/')
	.destination('./build/')
	.use(timer("init"))
	.use(data({
		config: './data/config.json',
		stuckism: './data/stuckism.json',
		items: './data/items.json'
	}))
	.use(timer("data (JSON imported)"))
	.use(json_to_files({ source_path: './data/' }))
	.use(timer("JSON to files"))
	.use(collections({
		art: { pattern: 'art/*.html' },
		photos: { pattern: 'photos/*.html' },
		objects: { pattern: 'objects/*.html' },
		web: { pattern: 'web/*.html' }
	}))
	.use(timer("collections"))
	.use(permalinks({ pattern: ':title' }))
	.use(timer("permalinks"))
	.use(inplace({
		engine: 'markdown',
		pattern: "**/*.njk",
		engineOptions: engineOptions
	}))
	.use(timer("markdown"))
	.use(layouts({
		engine: 'nunjucks',
		default: 'template.njk',
		pattern: "**/*.html",
		engineOptions: engineOptions
	}))
	.use(timer("layouts / Nunjucks"))
	.use(beautify())
	.use(timer("beautify"))
	.use(rename([ [/\.html$/, ".htm"] ]))
	.use(timer("rename"))
	.use(linkcheck({ verbose: true }))
	.use(timer("links checked"))
	.build(function (err) {
		if (err) { throw err; }
		console.log('Build finished!');
	});

