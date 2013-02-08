define([
    'jasmine-jquery',
    'streamhub-ticker/views/TickerView',
    'streamhub-backbone',
    '../MockHubCollection'],
function (jasmine, TickerView, Hub, MockHubCollection) {
describe('A TickerView', function () {
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
	        var view = new TickerView();
        	expect(view).toBeDefined();
    	});
    	it ("with empty options", function () {
        	var view = new TickerView({});
        	expect(view).toBeDefined();
    	});
    	it ("with only a Mock Hub.Collection", function () {
        	var view = new TickerView({
            	collection: new MockHubCollection()
        	});
    	    expect(view).toBeDefined();
    	});
	    it ("with an el", function () {
	        setFixtures('<div id="hub-TickerView"></div>');  
	        var view = new TickerView({
	            el: $('#hub-TickerView')
	        });
	        expect(view).toBeDefined();
	    });
	    it ("with an el and Mock Hub.Collection", function () {
	        setFixtures('<div id="hub-TickerView"></div>');  
	        var view = new TickerView({
	            collection: new MockHubCollection(),
	            el: $('#hub-TickerView')
	        });
	        expect(view).toBeDefined();
	    });
	    it ("with an el and Mock Hub.Collection and a mock feed collection", function () {
	        setFixtures('<div id="hub-TickerView"></div>');  
	        var view = new TickerView({
	            collection: new MockHubCollection(),
	            el: $('#hub-TickerView'),
	            feedCollection: new MockHubCollection()
	        });
	        expect(view).toBeDefined();
	    });
	});
	
	// post construction behavior    
    describe ("after correct construction", function () {
	    var view;
	    
	    beforeEach(function() {
	        setFixtures(
		        '<style>.hub-item{margin:0;padding:0;display:inline-block;width:50px;'+
		        'overflow:hidden;}</style><div style="position:relative;">'+
		        '<div id="hub-TickerView" style="position:absolute;overflow-x:scroll;'+
		        'white-space:nowrap;"></div></div>'
		    );
	        view = new TickerView({
	            collection: new MockHubCollection(),
	            el: $('#hub-TickerView'),
	            feedCollection: new MockHubCollection()
	        });
		});
        it ("should contain 53 mock items & childViews after setRemote", function () {
            view.collection.setRemote({});
            expect(Object.keys(view.childViews).length).toBe(53);
            expect(view.$el.find('.hub-item').length).toBe(53);
        });
        it ("should have scrolled all the way right after data was received", function () {
            view.$el.width(100);
            view.collection.setRemote({});
            view.$el.stop(true, true);
            expect(view.$el[0].scrollWidth).toBe(53 * 50); //items.count * item.width
            expect(view.$el.scrollLeft()).toBe(50 * 50 - 100); //bootstrap * item.width - el.width
        });
        it ("should be scrollable to a piece of content", function () {
            view.$el.width(100);
            view.collection.setRemote({});
            view.$el.stop(true, true);

            view.scrollTo('52');
            view.$el.stop(true, true);
            expect(view.$el.scrollLeft()).toBe(53 * 50 - 100); //item.id+1 * item.width - el.width);

            view.scrollTo('0');
            view.$el.stop(true, true);
            expect(view.$el.scrollLeft()).toBe(0); // it will stop at 0

            view.scrollTo('19');
            view.$el.stop(true, true);
            expect(view.$el.scrollLeft()).toBe(20 * 50 - 100); //item.id+1 * item.width - el.width
        });
        it ("should have populated the feed view collections after feedCol.setRemote", function () {
            view.collection.setRemote({});
            view.feedCollection.setRemote({});
            var keys = Object.keys(view.childViews);
            var total = 0;
            for (i in keys) {
            	feedCol = view.childViews[keys[i]].feedView.collection;
            	total = total + feedCol.length;
            	expect(feedCol.length).toBeLessThan(3);
            }
        	expect(total).toBe(53);
        });
    });
}); 
});