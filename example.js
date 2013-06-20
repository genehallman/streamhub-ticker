define(['streamhub-sdk', 'streamhub-ticker/views/TickerView'],
function(Hub, View) {
	return function(el) {
		var streams = Hub.StreamManager.create.livefyreStreams({
		    network: "labs-t402.fyre.co",
		    environment: "t402.livefyre.com",
		    siteId: "303827",
		    articleId: 'labs_demo_nbc_baseball'
		});
	
		var feedStreams = Hub.StreamManager.create.livefyreStreams({
		    network: "labs-t402.fyre.co",
		    environment: "t402.livefyre.com",
		    siteId: "303827",
		    articleId: 'labs_demo_social_baseball'
		});


	    var view = new View({el: el});
		
		streams.bind(view.main).start();
		feedStreams.bind(view.feed).start();
         
		return view;
	};
});
