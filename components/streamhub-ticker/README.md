# streamhub-ticker

streamhub-ticker is a StreamHub (Backbone) plugin that visualizes 2 streams as a ticker in X axis, and
feed views in the Y axis.

![Streamhub-ticker screenshot](https://drive.google.com/uc?id=0BwAX440-rUypRDU5ZVRraFprVHc "Streamhub-ticker screenshot")

Learn more about [StreamHub-Backbone](http://github.com/gobengo/streamhub-backbone)

## Prerequisites:
+ [npm](http://npmjs.org/)

## Documentation:
View the [API documentation](http://htmlpreview.github.com/?https://github.com/genehallman/streamhub-ticker/blob/master/docs/index.html).

### Streamhub Views:
The streamhub-ticker comes with 2 views for use with Livefyre's Streamhub:

+ `TickerView`: Provides the main construction point for the ticker. Takes content from the stream and displays it on the X axis with newest data on the right. It also animates the addition of new content, by sliding items in from the right.
+ `FeedTickerView`: Used by the TickerView, instantiated multipled times, this view provides a feed view, specifically for the displaying of the ticker Y axis data.

## To run the example site:

```
$ git clone git@github.com:genehallman/streamhub-ticker.git
$ cd streamhub-ticker
$ npm install
$ npm start
```

+ To see the demo, browse to [localhost:8080](http://localhost:8080)
+ To run the tests, browse to [localhost:8080/tests/index.html](http://localhost:8080/tests/index.html)
+ To see the docs, browse to [localhost:8080/docs/index.html](http://localhost:8080/docs/index.html)

## To install on your site:
The easiest way to use the streamhub-ticker is to install it via [bower](http://twitter.github.com/bower/) and [requirejs](http://requirejs.org/):

#### Install via Bower
Bower can be used to automatically download streamhub-ticker and its dependency tree.

```
$ bower install git://github.com/genehallman/streamhub-ticker.git
```

#### Use via Require.js
Once you've called bower install, you'll have a suite of components available to you in the ```./components``` directory. These can be accessed via Require.js, as shown below.

```
  ...
  
  <!-- Get requirejs -->
  <script src="components/requirejs/require.js" type="text/javascript"></script>
  <!-- Get Livefyre sdk loader -->
  <script src="http://zor.t402.livefyre.com/wjs/v3.0.sdk/javascripts/livefyre.js"></script>
  
  <script type="text/javascript">

  	require.config({
  		packages: [	{
  			name: 'streamhub-backbone',
  			location: 'components/streamhub-backbone'
  		},
  		{
  			name: "streamhub-ticker",
  			location: "components/streamhub-ticker"
  		}]
  	});
  
  	// Now to load the example
  	require(['streamhub-backbone', 'streamhub-ticker/views/TickerView'],
  	function(Hub, View) {
  			fyre.conv.load({network: "network.fyre.co"}, [{app: 'sdk'}], function(sdk) {
  	    	var col = window.col = new Hub.Collection().setRemote({
  	    		sdk: sdk,
  					siteId: "12345",
  					articleId: "article_1"
  			});
            
  	    	var feedCol = window.feedCol = new Hub.Collection();
  
  	    	col.on('initialDataLoaded', function() {
  	    		feedCol.setRemote({
  					sdk: sdk,
  					siteId: "12345",
  					articleId: "article_2"
  				});
  			}, this);
  
  			var view = new View({
  				collection: col,
  				el: document.getElementById("example"),
  				feedCollection:feedCol
  			});
  			view.render();
  		});
  	});
  <script>
  
  ...
```
