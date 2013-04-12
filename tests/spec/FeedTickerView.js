define([
    'jasmine',
    'streamhub-ticker/views/FeedTickerView',
    'streamhub-sdk',
    'streamhub-sdk/streams',
    '../MockStream',
    'jasmine-jquery'],
function (jasmine, FeedTickerView, Hub, Streams, MockStream) {
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
            	streams: new Streams({main: new MockStream()})
        	});
    	    expect(view).toBeDefined();
    	});
	    it ("with an el", function () {
	        setFixtures('<div id="hub-FeedTickerView"></div>');  
	        var view = new FeedTickerView({
	            el: $('#hub-FeedTickerView').get(0)
	        });
	        expect(view).toBeDefined();
	    });
	    it ("with an el and Mock Hub.Collection", function () {
	        setFixtures('<div id="hub-FeedTickerView"></div>');  
	        var view = new FeedTickerView({
	            collection: new Streams({main: new MockStream()}),
	            el: $('#hub-FeedTickerView')
	        });
	        expect(view).toBeDefined();
	    });
	});
	
	// post construction behavior    
    describe ("after correct construction", function () {
	    
        it ("should contain 50 mock items after streams.start()", function () {
	        setFixtures('<div id="hub-FeedTickerView"></div>');
		    var view = new FeedTickerView({
	            streams: new Streams({main: new MockStream()}),
	            el: $('#hub-FeedTickerView').get(0),
	        });
	        
	        var spy = jasmine.createSpy();
	        view.on('add', spy);
            view.streams.start();
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