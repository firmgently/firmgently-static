---
title: Small Test
date: 2017 10 25
tags: word,small-test
code: true
---

SMALL

```
module.exports = {
	// string-manipulation functions
	toLower: function(string) {
		return string.toLowerCase();
	},


	toUpper: function(string) {
		return string.toUpperCase();
	},


	spaceToDash: function(string) {
		return string.replace(/\s+/g, '-');
	},


	// caclulate CSS font size for tag cloud
	fontsizeFromTagWeight: function(weight, minSize, maxSize, numSizes) {
		// numSize = number of descrete sizes available -
		// can help aesthetically match various ranges of weights
		var  stepSize = (maxSize - minSize) / numSizes,
			size = minSize + (weight * stepSize);

		if (size > maxSize) { size = maxSize; }
		return Math.round(size * 100)/100;
	},


	// calculate a rough estimate on time to read an article
	// based on the number of words it contains
	averageReadTime: function(numWords) {
		var lowAverageWPM = 200,
			highAverageWPM = 300,
			slowMins = Math.round(numWords / lowAverageWPM),
			fastMins = Math.round(numWords / highAverageWPM),
			estimate;

		if (fastMins < 1) {
			estimate = 'less than a min';
		} else if (fastMins === slowMins) {
			estimate = 'about a min';
		} else {
			estimate = fastMins + ' - ' + slowMins + ' min';
		}
		return estimate;
	},


	// vanity function to keep the URL clean - when linking
	// into a directory the index.html can be ommitted
	stripIndexFromPath: function(path) {
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
	}
};
```
