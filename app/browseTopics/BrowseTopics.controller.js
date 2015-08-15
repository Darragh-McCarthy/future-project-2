(function() {
'use strict';

angular.module('myApp')
	.controller('BrowseTopics', BrowseTopics);

BrowseTopics.$inject = ['TopicService'];
function BrowseTopics(TopicService) {

    var _this = this;
    TopicService.getFeaturedTopicTitles().then(function(featuredTopicTitles) {
        _this.featuredTopicTitles = featuredTopicTitles;
    });
}

})();
