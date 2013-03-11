/** @module TickerView */

define(function(require) {
var Backbone = require('backbone'),
    ContentView = require('streamhub-backbone/views/ContentView'),
    FeedTickerView = require('streamhub-ticker/views/FeedTickerView');

/**
 * TickerView is a view of Streamhub data that is structured as a horizontal ticker, similar to
 * television media's ticker, time based, LTR. When the feedCollection option is specified, the
 * ticker view will use the content items in the feedCollection to populate the Y-axis of the
 * ticker, stacking all feedCollection items above the appropriate Ticker items, based on the
 * create date of the content. 
 * @alias module:TickerView
 * @constructor
 * @param {Object.<string, *>} opts A set of options to configure this instance.
 * @param {Hub.Collection|undefined} opts.feedCollection The feed collection that this ticker will use to
 *        populate it's Y axis. 
 * @param {Object.<string, *>} opts.sources A set of source specific options.
 * @param {string} opts.metaElement The selector of an element inside the bodyHtml of each content
 *        item that contains the meta data for this content item. 
 */
var TickerView = Backbone.View.extend(
/** @lends TickerView.prototype */
{
	/**
	 * Initializes a TickerView, and is called by backbone during view construction.
	 * Creates a couple of div's for styling and structure, then binds to the collection's add event.
	 * @param {Object.<string, *>} opts A set of options to configure this instance (@see constructor).
	 * @protected
	 */
    initialize: function (opts) {
        opts = opts || {};
        var self = this;

        this.$el.addClass(this.className);
        this.$el.hide();
        this.feedCollection = opts.feedCollection;
        this.childViews = {};
        this.metaElement = opts.metaElement;

        this.sources = opts.sources || {};
        
        if (this.collection) {
	        this.collection.on('add', this._insertItem, this);
	        // Fill the ticker with initial data
	        this.collection.each(function(item) {
	            self._insertItem(item, self.collection);
	        });
        }
        this.render();

        if (this.feedCollection) {
            // Add feed items for any initially passed data (eg cache)
            this.feedCollection.each(function (model, index, collection) {
                self._addFeedItem(model, collection);
            });
            this.feedCollection.on('add', this._addFeedItem, this);
        }
    },
    
    /**
     * className The css class name that this object will apply to it's holding element
     * @type {string} 
     * @default hub-TickerView
     */    
    className: "hub-TickerView",
    
    /**
     * Renders a TickerView. Fades the view's holding element into view, and scrolls to the latest
     * item.
     */
    render: function () {
        this.$el.fadeIn();
        // Scroll to latest tick
        if (this.collection) {
	        var latest = this.collection.at(this.collection.length-1);
	        var latestId = latest && latest.get('id');
	        if (latestId) {
	            this.scrollTo(latestId);
	        }
        }
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
TickerView.prototype._insertItem = function (item, col) {
    if (!item.get('author')) { return; }

    var feedEl = $(document.createElement('div'));
    feedEl.addClass('item-feed-view');

    var contentEl = $(document.createElement('div'));
    contentEl.addClass('item-content-view');

    var itemEl = $(document.createElement('div'));
    itemEl.append(feedEl);
    itemEl.append(contentEl);

    var itemMetaEl = $('<div>' + item.get('bodyHtml') + '</div>').find(this.metaElement);
    var itemMeta = {};
    try { itemMeta = JSON.parse(itemMetaEl.text()); } catch (ex) {}

    itemEl
      .addClass('hub-item')
      .attr('data-hub-contentid', item.get('id'))
      .attr('data-hub-createdAt', item.get('createdAt'))
      .attr('data-hub-source-id', item.get('sourceId'));
      
    if (itemMeta.eventType) {
        itemEl.attr('data-hub-event-type', itemMeta.eventType);
    }
    if (itemMeta.eventUrl) {
        itemEl.attr('data-hub-event-url', itemMeta.eventUrl);
        contentEl.css('background', 'url(' + itemMeta.eventUrl + ') no-repeat 0px 0px');
    }
    if (itemMeta.eventImportant) {
        itemEl.attr('data-hub-event-important', itemMeta.eventImportant);
    }
        
    var contentView = new ContentView({
        model: item,
        el: contentEl
    });
    
    var subCol = new Backbone.Collection();
    subCol.comparator = function(i) { return i.get('createdAt'); };

    var feedView = new FeedTickerView({
        collection: subCol,
        el: feedEl,
        sources: this.sources
    });
    feedView.render();
    
    this.childViews[item.get('createdAt')] = {feedView:feedView, item: item};
    
    this._animateAdd(itemEl, col, col.indexOf(item));
    
    //this._rebalanceFeedItems(item, col);
    
    return itemEl;
};

/**
 * Helper function to abstract the animation process on insertion. At this point in time,
 * the item's main element has not been inserted into the DOM. It is the responsibility of this
 * method to add the element to the DOM in any manner that it sees fit. 
 * @param {Object} itemEl The $html element for the item that is to be inserted.
 * @param {Backbone.Collection} col A reference to the collection that this item was added to.
 * @param {number} index The index in the collection to find the original item.
 * @protected
 */
TickerView.prototype._animateAdd = function(itemEl, col, index) {
    var prev, prevEl, i = 1;
    while (index > 0 && (!prevEl || (prevEl && prevEl.length <= 0)) && i <= index) {
	    prev = col.at(index-i);
    	prevEl = prev ? this.$el.find('.hub-item[data-hub-contentid="' + prev.get('id') + '"]') : null;
    	i++;
    }
    
    var origScrollWidth = this.$el[0].scrollWidth;

    if (prevEl && prevEl.length > 0) {
        itemEl.insertAfter(prevEl);
    } else {
        this.$el.prepend(itemEl);
    }
    var newScrollWidth = this.$el[0].scrollWidth;
    var diff = newScrollWidth - origScrollWidth;

    if (!this.paused && col._initialized && (index >= (col.size()-1))) {
        this.$el.animate({
            scrollLeft: this.$el.scrollLeft() + diff
        }, 500);
    } else if (!col._initialized || (index < (col.size()-1))) {
        this.$el.scrollLeft(this.$el.scrollLeft() + diff);
    }
};

/**
 * Helper function to rebalance feed items whenever we receive a main Ticker item out
 * of order. When this occurs, we step back over previous feed items, then check their
 * the item's main element has not been inserted into the DOM. It is the responsibility of this method
 * to add the element to the DOM in any manner that it sees fit. 
 * @param {Object} item The item that is to be inserted.
 * @param {Backbone.Collection} col A reference to the collection that this item was added to.
 * @param {number} index The index in the collection to find the original item.
 * @protected
 */
TickerView.prototype._rebalanceFeedItems = function(item, col) {
    var index = col.indexOf(item);
    var createdAt = item.get('createdAt');
    var feedCol = this.childViews[createdAt].feedView.collection;
    
    // this is going to trace backwards, then forewards along the the feed items,
    // in each collection, moving feed item that need to be in this newly added item's collection
    var prev;
    var prevFeedItem;
    var prevCursor = 0;
    while (!prevFeedItem || prevFeedItem.get('createdAt') > createdAt) {
        while (!prevFeedItem) {
            prev = null;
            prevCursor++;
            var prevItem = col.at(index-prevCursor);
            if (prevItem) {
                prev = this.childViews[prevItem.get('id')];
            }
            if (!prev) { break; }
            prevFeedItem = prev.item.collection.last();
        }
        if (!prev) { break; }
        if (prevFeedItem.get('createdAt') > createdAt) {
            console.log("Shuffled from prev: ", prevFeedItem.get('createdAt'), ' > ', createdAt);
            prev.item.collection.remove(prevFeedItem);
            feedCol.add(prevFeedItem);
        }
        prevFeedItem = prev.item.collection.last();
    }

    var next;
    var nextFeedItem;
    var nextCursor = 0;

    while (!nextFeedItem || nextFeedItem.get('createdAt') < createdAt) {
        while (!nextFeedItem) {
            next = null;
            nextCursor++;
            var nextItem = col.at(index+nextCursor);
            if (nextItem) {
                next = this.childViews[nextItem.get('id')];
            }
            if (!next) { break; }
            nextFeedItem = next.item.collection.first();
        }
        if (!next) { break; }
        if (nextFeedItem.get('createdAt') < createdAt) {
            console.log("Shuffled from next: ", nextFeedItem.get('createdAt'), ' < ', createdAt);
            next.item.collection.remove(nextFeedItem);
            feedCol.add(nextFeedItem);
        }
        nextFeedItem = next.item.collection.first();
    }
};

/**
 * Adds feedCollection items to the appropriate collection for the child FeedTickerViews.
 * @param {Object} item The new feed item that is to be inserted into the child.
 * @param {Backbone.Collection} col A reference to the feedCollection that item came from.
 * @protected
 */
TickerView.prototype._addFeedItem = function(item, col) {
    // parse the tree
    var itemCreatedAt = item.get('createdAt');
    var keys = Object.keys(this.childViews).sort();

    if (keys.length === 0) {
        return;
    }

    for (var i = 0; i < keys.length; i++) {
        if (itemCreatedAt >= keys[i] && (i == keys.length - 1 || itemCreatedAt < keys[i+1])) {
            var feedView = this.childViews[keys[i]].feedView;
            feedView.collection.add(item);
            break;
        }
    }
};

/**
 * Sets the scrollLeft the TickerView such that the element containing the specified contentId
 * aligns to the right of the current window.  
 * @param {number|string} contentId The id of the piece of content to scroll to.
 * @return The item that was scrolled to matching contentId
 */
TickerView.prototype.scrollTo = function(contentId) {
    var itemEl = this.$el.find('.hub-item[data-hub-contentid="'+ contentId +'"]');
    if (itemEl.length < 0) {
    	return null;
    }
    this.$el.animate({
        scrollLeft: this.$el.scrollLeft() + itemEl.position().left - itemEl.outerWidth()
    }, 500);
    return itemEl;
};

return TickerView;
});
