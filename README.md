# streamhub-ticker

streamhub-ticker is a [StreamHub App](http://apps.livefyre.com) that that visualizes two streams as a ticker in X axis (Ticker), and feed views in the Y axis (Feed). Display social content for various topics relevant to your website or app.

## Getting Started

The quickest way to use streamhub-feed is to use the built version hosted on Livefyre's CDN.

### Dependencies

streamhub-deck depends on [streamhub-sdk](https://github.com/livefyre/streamhub-sdk). Ensure it's been included in your page.

	<script src="http://cdn.livefyre.com/libs/sdk/v1.0.1-build.147/streamhub-sdk.min.gz.js"></script>

Include streamhub-deck too.

	<script src="http://cdn.livefyre.com/libs/apps/genehallman/streamhub-ticker/v2.0.1.build.3/streamhub-ticker.min.js"></script>
	
Optionally, include some reasonable default CSS rules for StreamHub Content. This stylesheet is provided by the StreamHub SDK.

    <link rel="stylesheet" href="http://cdn.livefyre.com/libs/sdk/v1.0.1-build.147/streamhub-sdk.gz.css" />

### Usage

1. Require streamhub-sdk and streamhub-ticker

        var Hub = Livefyre.require('streamhub-sdk'),
            TickerView = Livefyre.require('streamhub-ticker');
            
          
1. An empty ticker is no fun, define the Ticker (x-axis) and Feed (y-axis) collections to be displayed.

		  var tickerOpts = {
		      network: "labs-t402.fyre.co",
		      siteId: "303827",
		      articleId: "labs_tumblr_demo",
		      environment: "t402.livefyre.com"
          };
          var feedOpts = {
              network: "labs-t402.fyre.co",
              siteId: "303827",
              articleId: "labs_demo_fire",
              environment: "t402.livefyre.com"
          };

1.  Then create a stream manager for each collection.

          var tickerStreams = Hub.StreamManager.create.livefyreStreams(tickerOpts);
          var feedStreams = Hub.StreamManager.create.livefyreStreams(feedOpts);

1. Create a TickerView, passing the DOMElement to render it in (```el``` option).

        var tickerView = new TickerView({
            el: document.getElementById('ticker')
        });

1. Finally, bind both ticker and feed streamManagers to the Ticker View and start it up.

        tickerStreams.bind(tickerView.main).start();
        feedStreams.bind(tickerView.feed).start();

You now have a Deck! See this all in action on [this jsfiddle](http://jsfiddle.net/Syetu/2/).


## Local Development

Instead of using a built version of streamhub-feed from Livefyre's CDN, you may wish to fork, develop on the repo locally, or include it in your existing JavaScript application.

Clone this repo

    git clone https://github.com/genehallman/streamhub-ticker

Development dependencies are managed by [npm](https://github.com/isaacs/npm), which you should install first.

With npm installed, install streamhub-feed's dependencies. This will also download [Bower](https://github.com/bower/bower) and use it to install browser dependencies.

    cd streamhub-ticker
    npm install

This repository's package.json includes a helpful script to launch a web server for development

    npm start

You can now visit [http://localhost:8080/](http://localhost:8080/) to see an example feed loaded via RequireJS.

# StreamHub

[Livefyre StreamHub](http://www.livefyre.com/streamhub/) is used by the world's biggest brands and publishers to power their online Content Communities. StreamHub turns your site into a real-time social experience. Curate images, videos, and Tweets from across the social web, right into live blogs, chats, widgets, and dashboards. Want StreamHub? [Contact Livefyre](http://www.livefyre.com/contact/).
