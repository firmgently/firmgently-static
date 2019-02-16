const marked = require('marked');

// metalsmith-markdown uses `marked` internally
// get an instance of its renderer so we can customise it
let markdownRenderer = new marked.Renderer();

// to convert markdown images into figure/captions
markdownRenderer.image = function (href, title, text) {
	var suffix_ar = [ '_100w', '_500w', '_1000w' ],
	dotIndex = href.lastIndexOf('.'),
	p1 = href.substr(0, dotIndex),
	p2 = href.substr(dotIndex),
	src_ar = [], i, markup;

	for (i = 0; i < suffix_ar.length; i++) {
		src_ar[i] = p1 + suffix_ar[i] + p2;
	}

	if (title) {
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

module.exports = {
  renderer: markdownRenderer
};
