# streamhub-ticker

streamhub-ticker is a StreamHub (Backbone) plugin that visualizes 2 streams as a ticker in X axis, and
feed views in the Y axis.

Learn more about [StreamHub-Backbone](http://github.com/gobengo/streamhub-backbone)

## Prerequisites:
+ [bower](http://twitter.github.com/bower/)
+ python (optional for demo)

## Documentation:
### Views:
The streamhub-ticker comes with 2 views for use with Livefyre's Streamhub:

+ `TickerView`: Provides the main construction point for the ticker. Takes content from the stream and displays it on the X axis with newest data on the right. It also animates the addition of new content, by sliding items in from the right.
+ `FeedTickerView`: Used by the TickerView, instantiated multipled times, this view provides a feed view, specifically for the displaying of the ticker Y axis data.

### Constructing:
#### Options:
### Resizing:
### Loading content:
### Styling:


## To run the demo site:
```
$ git clone git@github.com:genehallman/streamhub-ticker.git
$ cd streamhub-ticker
$ bower install
$ python -m SimpleHTTPServer 8888
```

Then browse to [localhost:8888](http://localhost:8888)

## To install on your site:
