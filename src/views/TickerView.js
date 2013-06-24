/** @module TickerView */

define([
    'jquery',
    'streamhub-ticker/views/FeedTickerView',
    'streamhub-sdk',
    'streamhub-sdk/view',
    'streamhub-sdk/util',
    'text!streamhub-ticker/main.css'],
function($, FeedTickerView, Hub, View, Util, css) {

	/**
	 * TickerView is a view of Streamhub data that is structured as a horizontal ticker, similar to
	 * television media's ticker, time based, LTR. When the feedCollection option is specified, the
	 * ticker view will use the content items in the feedCollection to populate the Y-axis of the
	 * ticker, stacking all feedCollection items above the appropriate Ticker items, based on the
	 * create date of the content. 
	 * @alias module:TickerView
	 * @constructor
	 * @param {Object.<string, *>} opts A set of options to configure this instance.
	 * @param {Hub.Collection|undefined} opts.feedStreamName The feed collection that this ticker will
	 *        use to populate it's Y axis. 
	 * @param {Object.<string, *>} opts.sources A set of source specific options.
	 * @param {string} opts.metaElement The selector of an element inside the bodyHtml of each content
	 *        item that contains the meta data for this content item. 
     * @param {string} opts.className The css class name that this object will apply to it's holding
     *        element (defaults to "hub-TickerView").
	 */
	var TickerView = function(opts) {
        opts = opts || {};
        View.call(this, opts);
        var self = this;
        this.$el = $(this.el);
        this.$el.addClass(opts.className || "hub-TickerView");
        this.$el.hide();
        this.$el.fadeIn();
        this.includeCss = opts.includeCss == false ? false : true;
        // Include CSS
        if (this.includeCss) {
            $('<style></style>').text(css).prependTo('head');
        }

        var TickerContentAdder = {
            add: function(content, stream) {
                self.add.apply(self, arguments);
            }
        };
        var FeedTickerContentAdder = {
            add: function(content, stream) {
                self.addFeedItem.apply(self, arguments);
            }
        };
        this.main = TickerContentAdder;
        this.feed = FeedTickerContentAdder;

        this.childViews = {};
        this.metaElement = opts.metaElement;
    };
    $.extend(TickerView.prototype, View.prototype);

	/**
	 * Inserts a new piece of content into the dom. Used as a callback handler
	 * for collection.add events.
	 * @param {Object} item A piece of content that was streamed to this view from Streamhub.
	 * @return {Object} The $html element that was inserted.
	 * @protected
	 */
	TickerView.prototype.add = function (item) {
	    if (!item.author) { return; }

	    var contentView = this.createContentView(item);
	    contentView.render();
	
	    var feedEl = $(document.createElement('div'));
	    feedEl.addClass('item-feed-view');
	
	    var contentEl = $(contentView.el);
	    contentEl.addClass('item-content-view');
	
	    var itemEl = $(document.createElement('div'));
	    itemEl.append(feedEl);
	    itemEl.append(contentEl);
	
	    var itemMetaEl = $('<div>' + item.body + '</div>').find(this.metaElement);
	    var itemMeta = {};
	    try { itemMeta = JSON.parse(itemMetaEl.text()) || {}; } catch (ex) {}
	
	    itemEl
	      .addClass('hub-item')
	      .attr('data-hub-contentid', item.id)
	      .attr('data-hub-createdAt', item.createdAt)
	      .attr('data-hub-source-id', item.source);
	    
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

	    var feedView = new FeedTickerView({el: feedEl.get(0)});
	    
	    var key = item.createdAt*1000;
	    while (this.childViews[key]) {
	       key++;
	    }
	    key = key+"";
	    this.childViews[key] = {feedView:feedView, item: item, itemEl: itemEl};
	    
	    this._animateAdd(key);
	    
	    return itemEl;
	};
	
	/**
	 * Helper function to abstract the animation process on insertion. At this point in time,
	 * the item's main element has not been inserted into the DOM. It is the responsibility of this
	 * method to add the element to the DOM in any manner that it sees fit. 
	 * @param {number|string} key The key to the childViews set for the item to be inserted.
	 * @protected
	 */
	TickerView.prototype._animateAdd = function(key) {
	    var keys = Object.keys(this.childViews);
	    keys.sort();

	    var itemEl = this.childViews[key].itemEl;
        itemEl.attr('data-hub-key', key);

	    var index = $.inArray(key, keys);
	    var prevEl;
	    for (var i = index; i >= 0; i--) {
		    var prev = this.childViews[keys[i]].item;
	    	prevEl = prev ? this.$el.find('.hub-item[data-hub-key="' + keys[i] + '"]') : null;
	    	if (prevEl && prevEl.length) {
	    	    break;
	    	}
	    }

	    var origScrollWidth = this.el.scrollWidth;

	    if (prevEl && prevEl.length > 0) {
	        itemEl.insertAfter(prevEl);
	    } else {
	        this.$el.prepend(itemEl);
	    }
	    var newScrollWidth = this.$el[0].scrollWidth;
	    var diff = newScrollWidth - origScrollWidth;
	    //var scrollWindowWidth = Util.outerWidth(this.$el);
        var itemLeft = itemEl.position().left;

	    if (!this.paused && itemLeft >= 0 && diff >= 0) {
            this.scrollDiff = (this.scrollDiff || 0) + diff;
           
            if (!this.isScrolling) {
		        var self = this;
                this.isScrolling = true;
		        this.animator = function() {
                    self.$el.animateScrollLeft(
                        self.$el[0].scrollLeft + self.scrollDiff,
                        300, function() {
                        if (self.scrollDiff > 0) {
                            setTimeout(self.animator, 1);
                        } else {
                            self.isScrolling = false;
                        }
                    });

	                self.scrollDiff = 0;
	            };
	            this.animator();
            }
	    } else {
	        this.$el.scrollLeft(this.$el.scrollLeft() + diff);
	    }
	};

	/**
	 * Adds feedCollection items to the appropriate collection for the child FeedTickerViews.
	 * @param {Object} item The new feed item that is to be inserted into the child.
	 * @param {Backbone.Collection} col A reference to the feedCollection that item came from.
	 * @protected
	 */
	TickerView.prototype.addFeedItem = function(item, stream) {
	    // parse the tree
	    var itemCreatedAt = item.createdAt*1000;
	    var keys = Object.keys(this.childViews).sort();

	    if (keys.length === 0) {
	        return;
	    }
	
	    for (var i = 0; i < keys.length; i++) {
	        if (itemCreatedAt >= parseInt(keys[i]) && (i == keys.length - 1 || itemCreatedAt < parseInt(keys[i+1]))) {
	            var feedView = this.childViews[keys[i]].feedView;
			    feedView.emit('add', item, stream);
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
	    
	    this.isScrolling = true;
	    var self = this;

        this.$el.animateScrollLeft(
            this.$el[0].scrollLeft + itemEl.position().left - Util.outerWidth(itemEl),
            300, function() {
	        self.isScrolling = false;
        });
	    return itemEl;
	};
	
    /* Extend Zepto */
    (function($, undefined) {
        var interpolate = function (source, target, shift) {
            return (source + (target - source) * shift);
        };

        var easing = function (pos) {
            return (-Math.cos(pos * Math.PI) / 2) + .5;
        };

        var scroll = function(endX, duration, callback) {
            endX = (typeof endX !== 'undefined') ? endX : 0;
            duration = (typeof duration !== 'undefined') ? duration : 200;

            if (duration === 0) {
                this[0].scrollLeft = endX;
                if (typeof callback === 'function') callback();
                return;
            }

            var startX = this[0].scrollLeft,
            startT = Date.now(),
            finishT = startT + duration;

            var self = this;
            var animate = function() {
                var now = Date.now(),
                    shift = (now > finishT) ? 1 : (now - startT) / duration;

                self[0].scrollLeft = interpolate(startX, endX, easing(shift));

                if (now < finishT) {
                    setTimeout(animate, 15);
                }
                else {
                    if (typeof callback === 'function') callback();
                }
            };

            animate();
        };

        $.fn.animateScrollLeft = function() {
            scroll.apply(this, arguments);
            return this;
        };
    })($);

	return TickerView;
});

