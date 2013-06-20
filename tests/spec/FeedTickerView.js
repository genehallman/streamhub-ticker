define([
    'streamhub-zepto',
    'jasmine',
    'streamhub-ticker/views/FeedTickerView',
    'streamhub-sdk',
    '../MockStream',
    'jasmine-jquery'],
function ($, jasmine, FeedTickerView, Hub, MockStream) {
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
	    it ("with an el", function () {
	        setFixtures('<div id="hub-FeedTickerView"></div>');  
	        var view = new FeedTickerView({
	            el: $('#hub-FeedTickerView').get(0)
	        });
	        expect(view).toBeDefined();
	    });
	});
	
	// post construction behavior    
    describe ("after correct construction", function () {
	    
        it ("should contain 50 mock items after streams.start()", function () {
            var feedStreams = new Hub.StreamManager({main: new MockStream()});
	        setFixtures('<div id="hub-FeedTickerView"></div>');
		    var view = new FeedTickerView({
	            el: $('#hub-FeedTickerView').get(0)
	        });

	        var spy = jasmine.createSpy();
	        feedStreams.on('readable', spy);
            feedStreams.bind(view).start();
            waitsFor(function() {
                return spy.callCount == 50;
            });
            runs(function() {
                expect(spy.callCount).toBe(50);
	            expect(view.$el.find('article.content').length).toBe(50);
            });                            
            
        });
    });
}); 
});
