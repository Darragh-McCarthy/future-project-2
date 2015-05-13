(function(){
'use strict';

angular.module('myApp')
	.factory('TopicService', TopicService);

TopicService.$inject=[];
function TopicService() {

	return {
		'castParseTopicsAsPlainObjects':castParseTopicsAsPlainObjects,
		'castParseTopicAsPlainObject':castParseTopicAsPlainObject
	};


	function castParseTopicsAsPlainObjects(parseTopics) {
		var topics = [];
		angular.forEach(parseTopics, function(parseTopic) {
      topics.push(castParseTopicAsPlainObject(parseTopic));
    });
    return topics;
	}
	function castParseTopicAsPlainObject(parseTopic) {
    return {
      'title': parseTopic.get('title'),
      'url': parseTopic.get('url')
    };
  }

}


})();