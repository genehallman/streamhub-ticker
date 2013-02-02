define(function(require) {
var Backbone = require('backbone'),
    ContentView = require('streamhub-backbone/views/ContentView'),
    FeedTickerView = require('streamhub-ticker/views/FeedTickerView');

var TickerView = Backbone.View.extend(
{
    initialize: function (opts) {
        this.$el.addClass(this.className);
        this.$el.hide();
        this.feedCollection = opts.feedCollection;
        this.childViews = {};
        this.metaElement = opts.metaElement;

        this.sources = opts.sources || {};
        
        this.collection.on('add', this._insertItem, this);
        this.collection.on('initialDataLoaded', this.render, this);
        this.collection.each(function(item) {
        	self._insertItem(item, self.collection);
        });

        if (this.feedCollection) {
            this.feedCollection.on('add', this._addFeedItem, this);
        }
    },
    className: "hub-TickerView",
    render: function () {
        // todo : create sub divs
        this.$el.fadeIn();
    }
});

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
	var	itemMeta = {};
	try { itemMeta = JSON.parse(itemMetaEl.text()); } catch (ex) {}

    itemEl
      .addClass('hub-item')
      .attr('data-hub-contentid', item.get('id'))
      .attr('data-hub-createdAt', item.get('createdAt'))
      .attr('data-hub-source-id', item.get('sourceId'));
      
    if (itemMeta['eventType']) {
    	itemEl.attr('data-hub-event-type', itemMeta['eventType']);
    }
    if (itemMeta['eventUrl']) {
    	itemEl.attr('data-hub-event-url', itemMeta['eventUrl']);
    	contentEl.css('background', 'url(' + itemMeta['eventUrl'] + ') no-repeat 0px 0px');
    }
    if (itemMeta['eventImportant']) {
    	itemEl.attr('data-hub-event-important', itemMeta['eventImportant']);
    }
        
    var contentView = new ContentView({
        model: item,
        el: contentEl
    });
    
    var subCol = new Backbone.Collection();
    subCol.comparator = function(i) { return i.get('createdAt');};  

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

TickerView.prototype._animateAdd = function(itemEl, col, index) {
    var prev = col.at(index-1);
    var next = col.at(index+1);
    var origScrollWidth = this.$el[0].scrollWidth;
	var prevEl = prev ? this.$el.find('.hub-item[data-hub-contentid="' + prev.get('id') + '"]') : null;
    
    if (prevEl && prevEl.length > 0) {
        itemEl.insertAfter(prevEl);
    } else {
        this.$el.append(itemEl);
    }
    var newScrollWidth = this.$el[0].scrollWidth;
    var diff = newScrollWidth - origScrollWidth;

    if (!this.paused && col._initialized) {
        this.$el.animate({
            scrollLeft: this.$el.scrollLeft() + diff
        }, 500);
    } else if (!col._initialized) {
        this.$el.scrollLeft(this.$el.scrollLeft() + diff);
    }
};

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
            prevFeedItem = prev.item.collection.last()
        }
        if (!prev) { break; }
        if (prevFeedItem.get('createdAt') > createdAt) {
            console.log("Shuffled from prev: ", prevFeedItem.get('createdAt'), ' > ', createdAt);
            prev.item.collection.remove(prevFeedItem);
            feedCol.add(prevFeedItem);
        }
        prevFeedItem = prev.item.collection.last()
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
            nextFeedItem = next.item.collection.first()
        }
        if (!next) { break; }
        if (nextFeedItem.get('createdAt') < createdAt) {
            console.log("Shuffled from next: ", nextFeedItem.get('createdAt'), ' < ', createdAt);
            next.item.collection.remove(nextFeedItem);
            feedCol.add(nextFeedItem);
        }
        nextFeedItem = next.item.collection.first()
    }   
};

TickerView.prototype._addFeedItem = function(item, col) {
    // parse the tree
    var itemCreatedAt = item.get('createdAt');
    var keys = Object.keys(this.childViews).sort();

    if (keys.length == 0) {
        return;
    }

    for (var i = 0; i < keys.length; i++) {
        if (itemCreatedAt > keys[i] && (i == keys.length - 1 || itemCreatedAt < keys[i+1])) {
            var feedView = this.childViews[keys[i]].feedView;
            feedView.collection.add(item);
            break;
        }
    }
};

TickerView.prototype.scrollTo = function(contentId) {
	var itemEl = this.$el.find('[data-hub-contentid="'+ contentId +'"]');
	console.log(this.$el.scrollLeft(), itemEl.offset().left, window.outerWidth, itemEl.outerWidth());
	console.log(this.$el.scrollLeft() + itemEl.offset().left - window.outerWidth + itemEl.outerWidth());
    this.$el.animate({
        scrollLeft: this.$el.scrollLeft() + itemEl.offset().left - window.outerWidth + itemEl.outerWidth()
    }, 500);
	return itemEl;
};

return TickerView;
});
