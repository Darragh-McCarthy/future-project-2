(function(){
'use strict';

angular.module('myApp')
	.controller('BrowseTopics', BrowseTopics);


BrowseTopics.$inject=['Topic'];
function BrowseTopics( Topic ) {

	var browseTopics = this;
	browseTopics.topics = Topic.getTopics();

	var everythingTopic = {
		'title':'Everything',
		'imageUrl':'',
		'url':'#'
	};
	var personalisedFeedTopic = {
		'title':'Topics you follow',
		'imageUrl':'',
		'url':'#'
	};
	browseTopics.topics.unshift(everythingTopic, personalisedFeedTopic);
	
}

})();