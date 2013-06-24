/** @module FeedTickerView */

define(['jquery', 'streamhub-sdk/view'],
function($, View) {

	/**
	 * FeedTickerView is a view of Streamhub data that is structured as a feed, above a TickerView.
	 * @alias module:FeedTickerView
	 * @constructor
	 * @param {Object.<string, *>} opts A set of options to configure this instance.
	 * @param {Object.<string, *>} opts.contentViewOptions A set of options that will be passed
	 *        to the ContentView created when a new piece of content is added to this view's collection.
	 * @param {Object.<string, *>} opts.sources A set of source specific options.
	 * @param {string} opts.className The css class name that this object will apply to it's holding element.
	 */
	var FeedTickerView = function (opts) {
    	opts = opts || {};
    	View.call(this, opts);
    	this.$el = $(this.el);
        this._contentViewOpts = opts.contentViewOptions || {};
        this._sourceOpts = opts.sources || {};
        this.childContent = {};

        this.$el.addClass(opts.className || "hub-FeedTickerView");

        var outerHolder = $(document.createElement('div'));
        outerHolder.addClass('hub-feed-item-holder');
        
        this.itemHolder = $(document.createElement('div'));
        this.itemHolder.addClass('hub-feed-item-inner-holder');
        
        this.$el.append(outerHolder.append(this.itemHolder));
        
        var self = this;
        self.on('add', function(content, stream) {
            self.add(content);
        });
    };
    $.extend(FeedTickerView.prototype, View.prototype);

	/**
	 * Adds a new piece of content into the dom. Used as a callback handler
	 * for collection.add events.
	 * @param {Object} item A piece of content that was streamed to this view from Streamhub.
	 * @return {Object} The $html element that was inserted.
	 * @protected
	 */
	FeedTickerView.prototype.add = function (item) {
	    var contentView = this.createContentView(item);
	    contentView.render();

	    var key = item.createdAt * 1000;
	    while (this.childContent[key]) {
	       key++
	    }
	    key = key + "";
	    
	    this.childContent[key] = contentView;

	    var itemEl = $(contentView.el);
	    itemEl.attr('data-hub-key', key);
        var keys = Object.keys(this.childContent);
        keys.sort();

        var index = $.inArray(key, keys);
	
	    itemEl.hide();
	    
	    var origScroll = this.itemHolder.parent()[0].scrollHeight;
	    if (index <= 0) {
	        this.itemHolder.append(itemEl);
	        itemEl.show();
	    } else {
	        var prevEl = $(this.childContent[keys[index-1]].el);
	        itemEl.insertBefore(prevEl).show();
	    }
	    this.itemHolder.parent().addClass('nonEmpty');

	    return itemEl;
	};
	
	return FeedTickerView;
});
