(function() {
'use strict';

angular.module('myApp')
	.controller('BrowseTopics', BrowseTopics);

BrowseTopics.$inject = ['TopicService'];
function BrowseTopics(TopicService) {
    scroll(0, 0);

    var _this = this;
    TopicService.getFeaturedTopicTitles().then(function(featuredTopicTitles) {
        _this.featuredTopicTitles = featuredTopicTitles;
    });
}

})();
