define(function(require) {
	var Hub = require('streamhub-backbone');
	var View = require('streamhub-ticker/views/TickerView');

	return function(sdk, opts) {
        var col = window.col = new Hub.Collection().setRemote({
            sdk: sdk,
            siteId: opts.siteId,
            articleId: opts.articleId1
        });

        var feedCol = window.feedCol = new Hub.Collection();

        col.on('initialDataLoaded', function() {
            feedCol.setRemote({
                sdk: sdk,
                siteId: opts.siteId,
                articleId: opts.articleId2
            });
        }, this);

        var view = new View({
            collection: col,
            el: document.getElementById(opts.elementId),
            feedCollection:feedCol
        });
        
        view.render();
        
        return view;
    };
});