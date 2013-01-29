define(function(require) {
var Backbone = require('backbone'),
    ContentView = require('streamhub-backbone/views/ContentView');

var FeedTickerView = Backbone.View.extend(
{
    initialize: function (opts) {
        this.$el.addClass(this.className);
        this.$el.hide();
        
        var outerHolder = $(document.createElement('div'));
        outerHolder.addClass('hub-feed-item-holder')
        
        this.itemHolder = $(document.createElement('div'));
        this.itemHolder.addClass('hub-feed-item-inner-holder')
        
        this.$el.append(outerHolder.append(this.itemHolder));
        
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
    
    var cv = new ContentView({
        model: item,
        el: itemEl
    });
	
	this._animateAdd(itemEl, col, col.indexOf(item));
	
    return itemEl;
};

FeedTickerView.prototype._animateAdd = function(itemEl, col, index) {
	var prev = col.at(index-1);
	var next = col.at(index+1);
	var self = this;
	
	var origScroll = this.itemHolder[0].scrollHeight;
    if (index == 0) {
    	this.itemHolder.append(itemEl);
    } else {
    	prevEl = this.itemHolder.find('.hub-feed-item[data-hub-contentid=' + prev.get('id') + "]");
    	itemEl.insertBefore(prevEl);
    }
    this.itemHolder.parent().addClass('nonEmpty');
    var newScroll = this.itemHolder[0].scrollHeight;
    var diff = newScroll - origScroll;
        
	if (this.collection._initialized) {
	    this.itemHolder.scrollTop(diff);
		this.itemHolder.animate({
			scrollTop: 0
		}, 500);
	}
};

return FeedTickerView;
});
