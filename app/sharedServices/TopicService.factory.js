(function(){
'use strict';

angular.module('myApp')
	.factory('TopicService', TopicService);

TopicService.$inject=['$q','Parse'];
function TopicService( $q,  Parse ) {
  var ParseTopicModel = Parse.Object.extend("Topic");
  var minTopicCharacterLength = 2;
  var maxTopicCharacterLength = 100;
  var featuredTopicTitles = [
    'Technology',
    'Gaming',
    'Design',
    'Health',
    'Medicine',
    'Fashion',
    'Politics',
    'Sports',
    'Science',
    'Physics',
    'Economics',
    'Mathematics',
    'Startups',
    'Business',
    'Education',
    'Entertainment',
    'Movies',
    'Television'
  ];

	return {
		'castParseTopicsAsPlainObjects':castParseTopicsAsPlainObjects,
		'castParseTopicAsPlainObject':castParseTopicAsPlainObject,
		'getOrCreateNewTopicsByTitle': getOrCreateNewTopicsByTitle,
    'getTopicsById':getTopicsById,
    'getTopicByTitle':getTopicByTitle,
    'getEmptyTopicReferenceById':getEmptyTopicReferenceById,
    'featuredTopicTitles': featuredTopicTitles
	};



	function getEmptyTopicReferenceById(topicId) {
		var topic = new ParseTopicModel;
		topic.id = topicId;
		return topic;
	}


	function castParseTopicsAsPlainObjects(parseTopics) {
		var topics = [];
		angular.forEach(parseTopics, function(parseTopic) {
      topics.push(castParseTopicAsPlainObject(parseTopic));
    });
    return topics;
	}
	function castParseTopicAsPlainObject(parseTopic) {
    return {
    	'id': parseTopic.id,
      'title': parseTopic.get('title'),
      'url': parseTopic.get('url')
    };
  }

  function getOrCreateNewTopicsByTitle(topicTitles) {
    var promises = [];
    angular.forEach(topicTitles, function(eachTitle) {
      eachTitle = eachTitle.trim();
      promises.push(getOrCreateNewTopicByTitle(eachTitle));
    });
    return $q.all(promises);
  }
  function getOrCreateNewTopicByTitle(topicTitle) {
    return getTopicByTitle(topicTitle).then(function(existingTopic) { 
      if (existingTopic) {
        return existingTopic; 
      } else {
        return createNewTopic(topicTitle);
      }
    });
  }
	function getTopicByTitle(title) {
    var topicQuery = new Parse.Query(ParseTopicModel);
    topicQuery.equalTo('title', title);
    return topicQuery.first();
	}
	function createNewTopic(title) {
    return $q(function(resolve, reject) {
      if (title.length >= minTopicCharacterLength && title.length <= maxTopicCharacterLength) {
        var newTopic = new ParseTopicModel();
        newTopic.set('title', title);
        newTopic.save().then(function(topic){
          resolve(topic);
        });
      }
      else {
        reject();
      }
    });
	}
  function getTopicsById(ids) {
    var query = new Parse.Query(ParseTopicModel);
    return query.get(ids);
  }


}


})();