/** @module FeedTickerView */

define(function(require) {

var Backbone = require('backbone'),
    ContentView = require('streamhub-backbone/views/ContentView'),
    sources = require('streamhub-backbone/const/sources');

/**
 * FeedTickerView is a view of Streamhub data that is structured as a feed, above a TickerView.
 * @alias module:FeedTickerView
 * @constructor
 * @param {Object.<string, *>} opts A set of options to configure this instance.
 * @param {Object.<string, *>} opts.contentViewOptions A set of options that will be passed
 *        to the ContentView created when a new piece of content is added to this view's collection.
 * @param {Object.<string, *>} opts.sources A set of source specific options.
 */
var FeedTickerView = Backbone.View.extend(
/** @lends FeedTickerView.prototype */
{
	/**
	 * Initializes a FeedTickerView, and is called by backbone during view construction.
	 * Creates a couple of div's for styling and structure, then binds to the collection's add event.
	 * @param {Object.<string, *>} opts A set of options to configure this instance.
	 * @protected
	 */
    initialize: function (opts) {
    	opts = opts || {};
        this.$el.addClass(this.className);
        this.$el.hide();
        
        var outerHolder = $(document.createElement('div'));
        outerHolder.addClass('hub-feed-item-holder');
        
        this.itemHolder = $(document.createElement('div'));
        this.itemHolder.addClass('hub-feed-item-inner-holder');
        this.$el.append(this.itemHolder);

        this._contentViewOpts = opts.contentViewOptions || {};
        this._sourceOpts = opts.sources || {};
        
        this.$el.append(outerHolder.append(this.itemHolder));
        
        var self = this;
        if (this.collection) {
        	this.collection.on('add', this._insertItem, this);
        }
    },

    /**
     * @property {string} className The css class name that this object will apply to it's holding element
     * @default hub-FeedTickerView
     */
    className: "hub-FeedTickerView",

    /**
	 * Renders a FeedTickerView. Fades the view's holding element into view.
	 */
    render: function () {
        this.$el.fadeIn();
    }
});

/**
 * Inserts a new piece of content into the dom. Used as a callback handler
 * for collection.add events.
 * @param {Object} item A piece of content that was streamed to this view from Streamhub.
 * @param {Backbone.Collection} col A reference to the collection that this item was added to.
 * @return {Object} The $html element that was inserted.
 * @protected
 */
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

/**
 * Helper function to abstract the animation process on insertion. At this point in time,
 * the item's main element has not been inserted into the DOM. It is the responsibility of this method
 * to add the element to the DOM in any manner that it sees fit. 
 * @param {Object} itemEl The $html element for the item that is to be inserted.
 * @param {Backbone.Collection} col A reference to the collection that this item was added to.
 * @param {number} index The index in the collection to find the original item.
 * @protected
 */
FeedTickerView.prototype._animateAdd = function(itemEl, col, index) {
    var prev = col.at(index-1);
    var next = col.at(index+1);
    var self = this;
    itemEl.hide();
    
    var origScroll = this.itemHolder.parent()[0].scrollHeight;
    if (index === 0) {
        this.itemHolder.append(itemEl);
        itemEl.slideDown();
    } else {
        prevEl = this.itemHolder.find('.hub-feed-item[data-hub-contentid="' + prev.get('id') + '"]');
        itemEl.insertBefore(prevEl).slideDown();
    }
    this.itemHolder.parent().addClass('nonEmpty');
};

return FeedTickerView;
});
