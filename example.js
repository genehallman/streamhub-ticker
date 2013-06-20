define(['streamhub-sdk', 'streamhub-ticker/views/TickerView'],
function(Hub, View) {
	return function(sdk, opts) {
        var view = new View({
            streams: Hub.Streams.forCollection($.extend({}, opts, {articleId: opts.articleId1}).start(),
            feedStreams: Hub.Streams.forCollection($.extend({}, opts, {articleId: opts.articleId2}).start(),
            el: document.getElementById(opts.elementId),
        });
         
        return view;
    };
});
