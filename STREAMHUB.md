# streamhub-ticker

streamhub-ticker is a streamhub-sdk plugin that visualizes 2 streams as a ticker in X axis, and feed views in the Y axis.

The streamhub-ticker comes with 2 views for use with Livefyre's Streamhub:

+ ```TickerView```: Provides the main construction point for the ticker. Takes content from the stream and displays it on the X axis with newest data on the right. It also animates the addition of new content, by sliding items in from the right.
+ ```FeedTickerView```: Used by the TickerView, instantiated multipled times, this view provides a feed view, specifically for the displaying of the ticker Y axis data.
