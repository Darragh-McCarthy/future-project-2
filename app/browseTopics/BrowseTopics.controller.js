(function() {
'use strict';

angular.module('myApp')
	.controller('BrowseTopics', BrowseTopics);

BrowseTopics.$inject = ['TopicService'];
function BrowseTopics(TopicService) {
    var _this = this;
    _this.topics = TopicService.featuredTopicTitles;
    _this.expandedTopics = [];
    _this.toggleExpandTopic = toggleExpandTopic;

    function toggleExpandTopic (topic) {
        var index = _this.expandedTopics.indexOf(topic);
        if (index === -1) {
            _this.expandedTopics.push(topic);
        } else {
            _this.expandedTopics.splice(index, 1);
        }
    }
}

})();
