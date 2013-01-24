define(function(require) {
var Backbone = require('backbone'),
    Mustache = require('mustache'),
    ContentTemplate = require('text!streamhub-backbone/templates/Content.html'),
    ContentView = require('streamhub-backbone/views/ContentView'),
    sources = require('streamhub-backbone/const/sources'),
    _ = require('underscore');
    $ui = require('jqueryui');

var TickerView = Backbone.View.extend(
{
    initialize: function (opts) {
        this._contentViewOpts = opts.contentViewOptions || {};
        this._sourceOpts = opts.sources || {};
        this.$el.addClass(this.className);
        this.$el.hide();
        this.lastEventId = 0;

        this.collection.on('add', this._insertItem, this);
        this.collection.on('initialDataLoaded', this.render, this);
    },
    className: "hub-TickerView",
    score_history: {
    },
    render: function () {
        this.$el.fadeIn();
        this.$el.prev('.loading-indicator').hide();
    }
});

TickerView.prototype._insertItem = function (item, opts) {
    var self = this,
        newItem = $(document.createElement('div')),
        json = item.toJSON();

    if ( ! json.author) {
        // TODO: These may be deletes... handle them.
        console.log("DefaultView: No author for Content, skipping");
        return;
    }

    // Annotate for source filtering
    newItem.attr('data-hub-source-id', item.get('sourceId'));

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

    var cv = new ContentView(_.extend({
        model: item,
        el: newItem
    }, _getContentViewOpts(item)));

    newItem
      .addClass('hub-item')
      .attr('data-hub-contentId', json.id)
      .hide();

    if (this.collection._initialized) {
        this.$el.prepend(newItem);
    } else {
        this.$el.append(newItem);
    }
    return newItem.show("slide", {direction:'left'});
};

return TickerView;
});
