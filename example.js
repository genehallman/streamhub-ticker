define(function(require) {
	var Hub = require('streamhub-sdk');
	var View = require('streamhub-ticker/views/TickerView');

	return function(sdk, opts) {
        var view = new View({
            streams: Hub.Streams.forCollection($.extend({}, opts, {articleId: opts.articleId1}).start(),
            feedStreams: Hub.Streams.forCollection($.extend({}, opts, {articleId: opts.articleId2}).start(),
            el: document.getElementById(opts.elementId),
        });
         
        return view;
    };
});