'use strict';

const metalsmith = require('metalsmith'); // static site generator
const debug = require('metalsmith-debug'); // debugging
const markdown = require('metalsmith-markdown'); // convert markdown
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
const drafts = require('metalsmith-drafts'); // ignore posts marked as drafts
const sitemap = require('metalsmith-sitemap'); // create sitemap
const date_formatter = require('metalsmith-date-formatter'); // convert date formats for display

const filters = require('./filters.js'); // nunjucks filters
const custom_marked_renderer = require('./custom-marked-renderer.js'); 



// if REBUILDIMAGES then include image directory and clean build dir
// else (default) ignore image dir and don't clean build dir
var ignore_ar;
var clean;
if (process.env.REBUILDIMAGES === 'true') {
  ignore_ar = [];
  clean = true;
} else {
  ignore_ar = [ '**/src/images/**' ];
  clean = false;
}

// used to name topic directory
// ! IMPORTANT - changes to this directory name must be updated
// in layouts/post.njk
const topicDir = 'by';
const hostname = 'https://firmgently.co.uk';



metalsmith(__dirname)
  .ignore(ignore_ar)
  .source('./src/')
  .destination('./build/')
  .clean(clean)
  .metadata(
    {site: {
      title: 'Firm Gently',
      url: hostname,
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
        { name: 'jpeg', args: { quality: 80 } },
        { name: 'sharpen' }
      ]
    }, {
      src: 'images/items/hi_res/*.jpg',
      namingPattern: 'images/items/thumbs/{name}{ext}',
      methods: [
        { name: 'resize', args: [250, 250] },
        { name: 'resize', args: { fit: 'inside' } },
        { name: 'jpeg', args: { quality: 80 } },
        { name: 'sharpen' }
      ]
    }, {
      src: 'images/words/**.jpg',
      namingPattern: '{dir}{name}_100w{ext}',
      methods: [
        { name: 'resize', args: [300, 300] },
        { name: 'resize', args: { fit: 'outside' } },
        { name: 'jpeg', args: { quality: 80 } },
        { name: 'sharpen' }
      ]
    }, {
      src: 'images/words/**.jpg',
      namingPattern: '{dir}{name}_500w{ext}',
      methods: [
        { name: 'resize', args: [600, 600] },
        { name: 'resize', args: { fit: 'outside' } },
        { name: 'jpeg', args: { quality: 80 } },
        { name: 'sharpen' }
      ]
    }, {
      src: 'images/words/**.jpg',
      namingPattern: '{dir}{name}_1000w{ext}',
      methods: [
        { name: 'resize', args: [900, 900] },
        { name: 'resize', args: { fit: 'outside' } },
        { name: 'jpeg', args: { quality: 80 } },
        { name: 'sharpen' }
      ]
    }
  ]))
  .use(timer('images processed'))

  .use(sass({
    includePaths: ['css'],
		sourceMap: true,
    sourceMapContents: true,
		outputStyle: 'compressed'
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
		renderer: custom_marked_renderer.renderer,
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
  .use(timer('excerpts grabbed'))

  //
  .use(drafts())
  .use(timer('drafts ignored'))

// web.html => web/index.html
  .use(permalinks({
		relative: false,
    linksets: [{
			match: { collection: 'words' },
			pattern: 'words/:title'
    }]
	}))
  .use(timer('permalinked POSTS'))

// create collection lists
  .use(collections({
    all: {
      pattern: [
        'word/*/*.html',
        'art/*/*.html',
        'photo/*/*.html',
        'object/*/*.html',
        'web/*/*.html'
      ],
      sortBy: 'date',
      reverse: true
    },
    word: {
      pattern: 'word/*/*.html',
      sortBy: 'date',
      reverse: true
    },
    art: {
      pattern: 'art/*/*.html',
      sortBy: 'date',
      reverse: true
    },
    photo: {
      pattern: 'photo/*/*.html',
      sortBy: 'date',
      reverse: true
    },
    object: {
      pattern: 'object/*/*.html',
      sortBy: 'date',
      reverse: true
    },
    web: {
      pattern: 'web/*/*.html',
      sortBy: 'date',
      reverse: true
    }
  }))
  .use(timer('collections created'))

	//
  .use(metadata({
    'collections.word': {
      layout: 'post.njk'
    }
  }))
  .use(timer('metadata boilerplate added to posts'))

// I'd have expected that `wordcloud` would need to come after `tags`
// in the pipeline as it uses the tags. I was wrong.`tags` turns the
// comma separated string of tags that `wordcloud` needs into an array
// of objects containing a name and slug for each tag.
  .use(wordcloud({
    category: 'tags', // optional, default is tags
    reverse: false, // optional sort value on category, default is false
    path: '/' + topicDir // <- Notice that path is prefixed with slash for absolute path 
  }))
  .use(timer('tag cloud analysed/created'))

// analyse tags and create tag pages
  .use(tags({
    handle: 'tags', // yaml key for tag list in you pages
    path: topicDir + '/:tag.html', // path for result pages
    layout:'topic.njk',
    sortBy: 'date',
    reverse: true,
    skipMetadata: false, // skip updating metalsmith's metadata object. useful for improving performance on large blogs
    metadataKey: 'tags', // default: `tags`
    slug: { mode: 'rfc3986' }
  }))
  .use(timer('topic pages created from tags'))
  .use(permalinks({
		relative: false,
    linksets: [{
			match: topicDir + '/*',
			pattern: topicDir + '/:title'
    }]
	}))
  .use(timer('permalinked TOPICS'))

	.use(date_formatter({
		dates: [
			{
				key: 'date',
				format: 'MMMM DD, YYYY',
				out_key: 'dateNice'
			}, {
				key: 'date',
				format: 'YYYY',
				out_key: 'dateYear'
			}, {
				key: 'date',
				format: 'YYYY-MM-DD',
				out_key: 'dateTime'
			}
		]
	}))
  .use(timer('dates formatted'))

// fill in Nunjucks templates
// ??? processes template inheritance ???
  .use(layouts({ 
    pattern: ['**/*.html'],
    engine: 'nunjucks',
    default: 'template.njk',
    suppressNoFilesError: true, // as we're using changed()
    engineOptions: {
			filters: {
				toLower: filters.toLower,
				toUpper: filters.toUpper,
				fontsizeFromTagWeight: filters.fontsizeFromTagWeight,
				stripIndexFromPath: filters.stripIndexFromPath,
				averageReadTime: filters.averageReadTime,
				spaceToDash: filters.spaceToDash
			}
		}
  }))
  .use(timer('templates inherited'))

// tidy up outputted markup
  .use(beautify({
    indent_size: 2,
    indent_char: ' ',
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
				categories: file.tags ? file.tags.map(tag => tag.name) : undefined,
				image_url: file.share_thumbnail,
				description:  (file.itemData ? file.itemData.desc : null) || file.contents
			})
		})
	)
  .use(timer('RSS feed created'))

// sitemap
	.use(
		sitemap({
			hostname: hostname,
			omitIndex: true
		})
	)
  .use(timer('sitemap.xml created'))

  .use(linkcheck({ verbose: true }))
  .use(timer('links checked'))

  .build(function (err) {
    if (err) { throw err; }
    console.log('Build finished!');
  })

