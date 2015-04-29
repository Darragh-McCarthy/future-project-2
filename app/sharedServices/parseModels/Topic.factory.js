(function(){
	'use strict';



angular
	.module('myApp.sharedServices')
	.factory('TopicService',TopicService);


TopicService.$inject=['$q','Parse'];
function TopicService( $q,  Parse ) {

	var Topic = Parse.Object.extend("Topic");

	return {
		'getOrCreateNewTopics': getOrCreateNewTopics,
    'getTopicsById':getTopicsById,
    'getTopicByTitle':getTopicByTitle
	};





function getOrCreateNewTopics(topicTitles) {
    var promises = [];
    angular.forEach(topicTitles, function(title) {
      title = title.trim();
      promises.push(
      	getOrCreateNewTopic(title)
      );
    });
    return $q.all(promises)
      .then(function(results) {
        return results;
      })
    ;
  }

  function getOrCreateNewTopic(title) {
    return $q(function(resolve, reject){
      getTopicByTitle(title)
        .then(
          function(topic) {
            console.log('successfully found existing topic by same name', topic);
            resolve(topic);
          },
          function() { 
            console.log('topic lookup failed, creating topic')
            resolve(createNewTopic(title)); 
          }
        );
    });
  }

	function getTopicByTitle(title) {
		return $q(function(resolve, reject) {
      var topicQuery = new Parse.Query(Topic);
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

      var topic = new Topic();

      console.log('createNewTopic', title);
      topic.save({'title':title})
        .then(function(){
          resolve(topic);
        });

    });
	}

  function getTopicsById(ids) {
    var topicQuery = new Parse.Query(Topic);
    return $q(function (resolve, reject) {
      topicQuery.get(ids, {
        success: function(results){
          if (results) {
            resolve(results);
          }
          else {
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