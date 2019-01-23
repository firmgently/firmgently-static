/*jslint es6 */

/*
 * Metalsmith build file
 * Build site with `node build`
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
	.use(data({
		config: './data/config.json',
		stuckism: './data/stuckism.json',
		items: './data/items.json'
	}))
	.use(json_to_files({
		source_path: './data/'
	}))
	.use(collections({
		art: { pattern: 'art/*' },
		photos: { pattern: 'photos/*' },
		objects: { pattern: 'objects/*' },
		web: { pattern: 'web/*' }
	}))
	.use(permalinks({
		pattern: ':added/:title',
		added: 'YYYY'
	}))
	.use(inplace({
		engine: 'markdown',
		pattern: "**/*.njk",
		engineOptions: engineOptions
	}))
	.use(layouts({
		engine: 'nunjucks',
		default: 'template.njk',
		pattern: "**/*.html",
		engineOptions: engineOptions
	}))
	.use(beautify())
	.use(rename([[/\.html$/, ".htm"]]))
	.build(function (err) {
		if (err) { throw err; }
		console.log('Build finished!');
	});

