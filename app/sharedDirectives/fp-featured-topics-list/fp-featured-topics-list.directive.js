(function() {
'use strict';

angular.module('myApp')
    .directive('fpFeaturedTopicsList', function() {
        return {
            templateUrl: '/sharedDirectives/fp-featured-topics-list/fp-featured-topics-list.template.html',
            bindToController: true,
            controller: 'FpFeaturedTopicsList as ctrl',
            scope: {}
        };
    })
    .controller('FpFeaturedTopicsList', FpFeaturedTopicsList);

FpFeaturedTopicsList.$inject = ['TopicService'];
function FpFeaturedTopicsList(TopicService) {
    var _this = this;
    TopicService.getFeaturedTopicTitles().then(function(featuredTopicTitles) {
        _this.topicTitles = featuredTopicTitles;
    });
}

})();
