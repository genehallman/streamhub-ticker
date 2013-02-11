define([
    'jasmine-jquery',
    'streamhub-ticker/views/FeedTickerView',
    'streamhub-backbone',
    '../MockHubCollection'],
function (jasmine, FeedTickerView, Hub, MockHubCollection) {
describe('A FeedTickerView', function () {
    it ("can have tests run", function () {
        expect(true).toBe(true);
    });
    it("can do HTML tests",function(){  
        setFixtures('<div id="hub"></div>');  
        $('#hub')
            .append('<li>So</li>')
            .append('<li>So</li>');
        expect($('#hub li').length).toBe(2);  
    });
	
	// construction behavior
    describe('can be constructed', function() {
    	it ("with no options", function () {
	        var view = new FeedTickerView();
        	expect(view).toBeDefined();
    	});
    	it ("with empty options", function () {
        	var view = new FeedTickerView({});
        	expect(view).toBeDefined();
    	});
    	it ("with only a Mock Hub.Collection", function () {
        	var view = new FeedTickerView({
            	collection: new MockHubCollection()
        	});
    	    expect(view).toBeDefined();
    	});
	    it ("with an el", function () {
	        setFixtures('<div id="hub-FeedTickerView"></div>');  
	        var view = new FeedTickerView({
	            el: $('#hub-FeedTickerView')
	        });
	        expect(view).toBeDefined();
	    });
	    it ("with an el and Mock Hub.Collection", function () {
	        setFixtures('<div id="hub-FeedTickerView"></div>');  
	        var view = new FeedTickerView({
	            collection: new MockHubCollection(),
	            el: $('#hub-FeedTickerView')
	        });
	        expect(view).toBeDefined();
	    });
	});
	
	// post construction behavior    
    describe ("after correct construction", function () {
	    
        it ("should contain 53 mock items after setRemote", function () {
	        setFixtures('<div id="hub-FeedTickerView"></div>');
		    var view = new FeedTickerView({
	            collection: new MockHubCollection(),
	            el: $('#hub-FeedTickerView'),
	        });
	        
            view.collection.setRemote({});
            expect(view.$el.find('.hub-feed-item').length).toBe(53);
        });
    });
}); 
});