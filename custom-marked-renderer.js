const marked = require('marked');

// metalsmith-markdown uses `marked` internally
// get an instance of its renderer so we can customise it
let markdownRenderer = new marked.Renderer();

// to convert markdown images into figure/captions
markdownRenderer.image = function (href, title, text) {
	var suffix_ar = [ '_300w', '_600w', '_900w' ],
	dotIndex = href.lastIndexOf('.'),
	p1 = href.substr(0, dotIndex),
	p2 = href.substr(dotIndex),
	src_ar = [], i, markup,
  srcset_str, sizes_str;

  // build image paths with srcset filenames
	for (i = 0; i < suffix_ar.length; i++) {
		src_ar[i] = p1 + suffix_ar[i] + p2;
	}

  srcset_str = `
				srcset="${src_ar[0]} 300w, ${src_ar[1]} 600w, ${src_ar[2]} 900w"
  `;

  sizes_str = `
				sizes="(min-width: 800px) 50vw,
					(min-width: 1200px) ) 33vw, 
					100vw"
  `;

	if (title) {
		markup = `<figure>
			<img src="${href}" alt="${text}" title="${title}" ${srcset_str} ${sizes_str}>
			<figcaption>
				<p>${title}</p>
			</figcaption>
		</figure>`;
	} else {
		markup = `<img src="${href}" alt="${text}" ${srcset_str} ${sizes_str}>`;
	}
	return markup;
};

module.exports = {
  renderer: markdownRenderer
};
