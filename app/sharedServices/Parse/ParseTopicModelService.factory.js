(function(){
	'use strict';



angular
	.module('myApp.sharedServices')
	.factory('ParseTopicModelService',ParseTopicModelService);


ParseTopicModelService.$inject=['$q','Parse'];
function ParseTopicModelService( $q,  Parse ) {

	var ParseTopicModel = Parse.Object.extend("Topic");

	return {
		'promiseGetOrCreateNewTopics': promiseGetOrCreateNewTopics,
    'promiseTopicsById':promiseTopicsById,
    'promiseTopicByTitle':promiseTopicByTitle
	};

  function promiseGetOrCreateNewTopics(topicTitles) {
    var promises = [];
    angular.forEach(topicTitles, function(title) {
      title = title.trim();
      promises.push(
      	promiseGetOrCreateNewTopic(title)
      );
    });
    return $q.all(promises)
      .then(function(results) {
        return results;
      })
    ;
  }

  function promiseGetOrCreateNewTopic(title) {
    return $q(function(resolve, reject){
      promiseTopicByTitle(title).then(
        function(topic) { resolve(topic); },
        function()      { resolve(createNewTopic(title)); }
      );
    });
  }

	function promiseTopicByTitle(title) {
		return $q(function(resolve, reject) {
      var topicQuery = new Parse.Query(ParseTopicModel);
      topicQuery.equalTo('title', title);
      topicQuery.first({
        success: function(results){
          if (results) {
            resolve(results);
          } else {
            reject();
          }
        },
        error: function(error){
          console.log(error);
          reject(error);
        }
      });
    });
	}



	function createNewTopic(title) {
		return $q(function(resolve, reject) {

      var topic = new ParseTopicModel();

      console.log('createNewTopic', title);
      topic.save({'title':title})
        .then(function(){
          resolve(topic);
        });

    });
	}

  function promiseTopicsById(ids) {
    var topicQuery = new Parse.Query(ParseTopicModel);
    return $q(function (resolve, reject) {
      topicQuery.get(ids, {
        success: function(results){
          if (results) {
            resolve(results);
          } else {
            resolve([]);   
          }
        },
        error: function(){
          console.log()
        }
      })
    })
  }


}




})();