(function(){
	'use strict';



angular
	.module('myApp.sharedServices')
	.factory('ParseTopicModelService',ParseTopicModelService);


ParseTopicModelService.$inject=['$q','Parse'];
function ParseTopicModelService( $q,  Parse ) {

	var ParseTopicModel = Parse.Object.extend("Topic");

	return {
		'getOrCreateNewTopicsByTitle': getOrCreateNewTopicsByTitle,
    'getTopicsById':getTopicsById,
    'getTopicByTitle':getTopicByTitle
	};

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
    var newTopic = new ParseTopicModel();
    newTopic.set('title', title);
    return newTopic.save();
	}
  function getTopicsById(ids) {
    var query = new Parse.Query(ParseTopicModel);
    return query.get(ids);
  }


}




})();