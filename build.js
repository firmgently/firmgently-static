/*jslint es6 */

/*
 * Metalsmith build file
 * Build site with `node build`
 */

'use strict';

const metalsmith = require('metalsmith');
const inplace = require('metalsmith-in-place');
const layouts = require('metalsmith-layouts');
const beautify = require('metalsmith-beautify');
const rename = require('metalsmith-rename');
const data = require('metalsmith-data');

const toUpper = function(string) {
	return string.toUpperCase();
};

const spaceToDash = function(string) {
	return string.replace(/\s+/g, "-");
};

const shuffle = function(a) {
	var j, x, i;
	for (i = a.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = a[i];
		a[i] = a[j];
		a[j] = x;
	}
	return a;
};

const stripTags = function(string) {
  return string.replace(/<\/?[^>]+(>|$)/g, "");
};

const engineOptions = {
	filters: {
		shuffle: shuffle,
		toUpper: toUpper,
		stripTags: stripTags,
		spaceToDash: spaceToDash
	}
};

metalsmith(__dirname)
	.clean(true)
	.source('./src/')
	.destination('./build/')
	.use(data({
		config: './data/config.json',
		items: './data/items.json'
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
