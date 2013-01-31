define(function(require) {
var Backbone = require('backbone'),
    ContentView = require('streamhub-backbone/views/ContentView'),
    sources = require('streamhub-backbone/const/sources');

var FeedTickerView = Backbone.View.extend(
{
    initialize: function (opts) {
        this.$el.addClass(this.className);
        this.$el.hide();
        
        var outerHolder = $(document.createElement('div'));
        outerHolder.addClass('hub-feed-item-holder')
        
        this.itemHolder = $(document.createElement('div'));
        this.itemHolder.addClass('hub-feed-item-inner-holder')
        this.$el.append(this.itemHolder);

        this._contentViewOpts = opts.contentViewOptions || {};
        this._sourceOpts = opts.sources || {};
        
        this.$el.append(outerHolder.append(this.itemHolder));
        
		var self = this;
        this.collection.on('add', this._insertItem, this);
    },
    className: "hub-FeedTickerView",
    render: function () {
        this.$el.fadeIn();
    }
});

FeedTickerView.prototype._insertItem = function (item, col) {
    var itemEl = $(document.createElement('div'));
    var json = item.toJSON();
    
    if (!json.author) { return; }

    itemEl
      .addClass('hub-feed-item')
      .attr('data-hub-contentId', json.id)
      .attr('data-hub-source-id', item.get('sourceId'));

    // Interleave configured default opts with source-specific opts
    var self = this;
    function _getContentViewOpts (content) {
        var opts = {},
            configuredOpts = _(opts).extend(self._contentViewOpts),
            perSourceOpts;
        if (content.get('source')==sources.TWITTER) {
            return _(configuredOpts).extend(self._sourceOpts.twitter||{});
        }
        if (content.get('source')==sources.RSS) {
            return _(configuredOpts).extend(self._sourceOpts.rss||{});
        }
        return configuredOpts;
    }

    // Create the ContentView so we can look at it and stuff!
    // render it in itemEl
    var cv = new ContentView(_.extend({
        model: item,
        el: itemEl
    }, _getContentViewOpts(item)));
	
	this._animateAdd(itemEl, col, col.indexOf(item));
	
    return itemEl;
};

FeedTickerView.prototype._animateAdd = function(itemEl, col, index) {
	var prev = col.at(index-1);
	var next = col.at(index+1);
	var self = this;
	itemEl.hide();
	
	var origScroll = this.itemHolder.parent()[0].scrollHeight;
    if (index == 0) {
    	this.itemHolder.append(itemEl);
    	itemEl.slideDown();
    } else {
    	prevEl = this.itemHolder.find('.hub-feed-item[data-hub-contentid="' + prev.get('id') + '"]');
    	itemEl.insertBefore(prevEl).slideDown();
    }
    this.itemHolder.parent().addClass('nonEmpty');
    /*var newScroll = this.itemHolder.parent()[0].scrollHeight;
    var diff = newScroll - origScroll;
        
	if (this.collection._initialized) {
	    this.itemHolder.parent().scrollTop(diff);
		this.itemHolder.parent().animate({
			scrollTop: 0
		}, 500);
	}*/
};

return FeedTickerView;
});
