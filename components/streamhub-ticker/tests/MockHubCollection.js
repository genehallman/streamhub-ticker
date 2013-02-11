/** @module MockHubCollection */

define(['streamhub-backbone'], function (Hub) {

var MockHubCollection = Hub.Collection.extend({
    initialize: function (opts) {}
});

MockHubCollection.prototype.setRemote = function (remoteOptions) {
	// wait for a second then dump a whole bunch of data,
	// then call start
	for (var i = 0; i < 50; i++) {
		this.add(this._createMockContent());
	}
	this._initialized = true;
	this.trigger('initialDataLoaded');
	this.start();
};

/**
 * Gets a mock author object
 * @return {Object} Mock author
 */ 
MockHubCollection.prototype.getAuthor = function (authorId) {
    return this._createMockAuthor(authorId);
};

/**
 * Returns a value that each item in the Collection should be sorted by.
 * By default, this is the Content's `createdAt` timestamp
 * @param {Hub.Content} item A Content model
 * @return {number} Content item's createdAt timestamp
 */
MockHubCollection.prototype.comparator = function (item) {
    return item.get('createdAt');
};

/**
 * Loads additional mock data and populates this collection object with the result.
 */
MockHubCollection.prototype.loadMore = function () {
};

/**
 * Start mocking the stream by adding 3 pieces of content
 * to the collection.
 * @return {MockHubCollection} this 
 */
MockHubCollection.prototype.start = function () {
	this.add(this._createMockContent());
	this.add(this._createMockContent());
	this.add(this._createMockContent());
    return this;
};

/**
 * Start mocking the stream by adding 3 pieces of content
 * to the collection over 3 seconds.
 * @return {MockHubCollection} this 
 */
MockHubCollection.prototype.setUserToken = function (token) {
    this._userToken = token;
};

MockHubCollection.prototype.post = function (json) {
};

MockHubCollection.prototype._createMockContent = function() {
    this._mockContentId = this._mockContentId || 0;
    var attrs = {
        id: this._mockContentId++,
        event: Date.now()*1000 + this._mockContentId,
        bodyHtml: "This is message " + this._mockContentId,
        ancestorId: null,
        annotations: {},
        author: this._createMockAuthor(this._mockContentId),
        authorId: this._mockContentId + "@mock.com",
        createdAt: Math.floor(Date.now() / 1000) + this._mockContentId,
        updatedAt: Math.floor(Date.now() / 1000) + this._mockContentId,
        replaces: null,
        parentId: null,
        source: 5,
        transport: 1,
        type: 0,
        vis: 1
    };
    return new Hub.Content(attrs);
};

MockHubCollection.prototype._createMockAuthor = function(id) {
	return {
		avatar: "http://gravatar.com/avatar/e23293c6dfc25b86762b045336233add/?s=50&d=http://d10g4z0y9q0fip.cloudfront.net/a/anon/50.jpg",
		displayName: "Mock " + id,
		id: id + "@mock.com",
		profileUrl: "",
		tags: []
	}
};

return MockHubCollection;
});
