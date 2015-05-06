(function(){
'use strict';


angular
	.module('myApp.sharedServices')
	.factory('PredictionService', PredictionService);




PredictionService.$inject=['$q','Parse','TopicService','LikelihoodEstimateService'];
function PredictionService( $q,  Parse,  TopicService,  LikelihoodEstimateService ) {
  
	var Prediction = Parse.Object.extend('Prediction');

  return {
    'getSomePredictions': getSomePredictions,
    'addNewPrediction': addNewPrediction,
    'getPredictionsByTopicTitle': getPredictionsByTopicTitle,
    'addLikelihoodEstimate': addLikelihoodEstimate
    }




  function getPredictionsByTopicTitle (topicTitle) {
    return $q(function(resolve, reject) {

      getParsePredictionsByTopicTitle(topicTitle)
        .then(function(parsePredictions){

          var predictions = [];

          angular.forEach(parsePredictions, function(parsePrediction){
            var prediction = makeParselessPrediction(parsePrediction);
            predictions.push(prediction)
          })

          resolve(predictions);

        });

    });
  }




  function getSomePredictions() {
    var predictionQuery = new Parse.Query(Prediction);

    return $q(function(resolve, reject) {
      predictionQuery.include('topics');
      predictionQuery.find({

        success: function(results) {
          console.log(results);

          var predictionList = [];

          angular.forEach(results, function(object) {
            var prediction = makeParselessPrediction(object)
            predictionList.push(prediction);
          });

          resolve(predictionList);
        },
        error: function(error) {
          console.log('Error: ' + error.code + ' ' + error.message);
        }

      });
    });
  }

  function makeParselessPrediction ( parsePrediction ) {
    var topics = [];

    angular.forEach(parsePrediction.get('topics'), function(topic) {
      var parselessTopic = makeParselessTopic(topic);
      topics.push(parselessTopic);
    });

    var prediction = {
      'id':                       parsePrediction.id,
      'created':                  parsePrediction.createdAt,
      'title':                    parsePrediction.get('title'),
      'topics':                   topics
    };
    prediction.communityEstimates = [];
    prediction.communityEstimatesCount = 0;

    angular.forEach([100,90,80,70,60,50,40,30,20,10,0], function(percent) {
      var percentEstimateCount = parsePrediction.get('percentEstimateCount' + percent);
      if ( ! percentEstimateCount ) {
        percentEstimateCount = 0;
      }
      prediction.communityEstimates.push({'percent':percent, 'count':percentEstimateCount});
      prediction.communityEstimatesCount += percentEstimateCount;
    });

    return prediction;
  }


  function makeParselessTopic ( parseTopic ) {
    return {
      'title': parseTopic.get('title'),
      'url': parseTopic.get('url')
    };
  }


  function addNewPrediction ( title, topicTitles ) {
    return $q(function(resolve, reject) {
      var currentUser = Parse.User.current();

      if ( ! currentUser) {
        reject();
        console.log('cannot addNewPrediction because user not logged into Parse');
        return;
      }

      if ( ! title || ! topicTitles.length) {
        console.log('invalid input; failed to create prediction');
        reject();
        return;
      }

      TopicService.getOrCreateNewTopics(topicTitles)
        .then(function(topics) {
          var prediction = new Prediction();

          prediction.save({
            'title': title,
            'topics': topics,
            'author': currentUser
          })
          .then(
            function() { 
              console.log('save successful'); 
              resolve();
            },
            function() { 
              console.log('save failed'); 
              reject();
            }
          );
        })
      ;


    });

  }

  function getParsePredictionsByTopicTitle (topicTitle) {
    return $q(function(resolve, reject){

      TopicService.getTopicByTitle(topicTitle)
        .then(function(topic){
          var predictionQuery = new Parse.Query(Prediction);
          predictionQuery.include('topics');
          predictionQuery.equalTo('topics', topic);
          predictionQuery
            .find({
              success: function(results){
                resolve(results); 
              },
              error: function(){
                reject();
              }
            });

        });
    });
  }



  function addLikelihoodEstimate(predictionId, percent) {
    return $q(function(resolve, reject) {

      var predictionLikelihoodEstimateOptions = [0,10,20,30,40,50,60,70,80,90,100];
      if ( predictionLikelihoodEstimateOptions.indexOf(percent) === -1 ) {
        reject();
      }

      var currentParseUser = Parse.User.current();
      if ( ! currentParseUser ) {
        reject();
      }

      var predictionQuery = new Parse.Query(Prediction);
      predictionQuery
        .get(predictionId)
        .then(function(prediction) {
          if ( ! prediction) {
            reject();
          } else {
            //LikelihoodEstimateService
            //  .addNew(currentParseUser, prediction, percent)
            //  .then(function() {

                prediction.increment('percentEstimateCount'+percent);
                prediction.save({
                  success: function(prediction){
                    resolve(makeParselessPrediction(prediction));
                  },
                  error: function(){
                    reject();
                  }
                });

              //})
            //;

          }

        })
      ;

      
      
    });
  }

}



})();
/*

myObject.fetch({
  success: function(myObject) {
    // The object was refreshed successfully.
  },
  error: function(myObject, error) {
    // The object was not refreshed successfully.
    // error is a Parse.Error with an error code and message.
  }
});

gameScore.increment("score");
gameScore.save();
You can also increment by any amount by passing in a second argument to increment. When no amount is specified, 1 is used by default.


add append the given object to the end of an array field.
addUnique add the given object only if it isn't already contained in an array field. The position of the insert is not guaranteed.
remove remove all instances of the given object from an array field.
For example, we can add items to the set-like "skills" field like so:

gameScore.addUnique("skills", "flying");
gameScore.addUnique("skills", "kungfu");
gameScore.save();
Note that it is not currently possible to atomically add and remove items from an array in the same save. You will have to call save in between every different kind of array operation.


myObject.destroy({
  success: function(myObject) {
    // The object was deleted from the Parse Cloud.
  },
  error: function(myObject, error) {
    // The delete failed.
    // error is a Parse.Error with an error code and message.
  }
});
// After this, the playerName field will be empty
myObject.unset("playerName");
 
// Saves the field deletion to the Parse Cloud
myObject.save();



// Declare the types.
var Post = Parse.Object.extend("Post");
var Comment = Parse.Object.extend("Comment");
 
// Create the post
var myPost = new Post();
myPost.set("title", "I'm Hungry");
myPost.set("content", "Where should we go for lunch?");
 
// Create the comment
var myComment = new Comment();
myComment.set("content", "Let's do Sushirrito.");
 
// Add the post as a value in the comment
myComment.set("parent", myPost);
 
// This will save both myPost and myComment
myComment.save();



Internally, the Parse framework will store the referred-to object in just one place, to maintain consistency. You can also link objects using just their objectIds like so:

var post = new Post();
post.id = "1zEcyElZ80";
 
myComment.set("parent", post);


By default, when fetching an object, related Parse.Objects are not fetched. These objects' values cannot be retrieved until they have been fetched like so:

var post = fetchedComment.get("parent");
post.fetch({
  success: function(post) {
    var title = post.get("title");
  }
});


By default, when fetching an object, related Parse.Objects are not fetched. These objects' values cannot be retrieved until they have been fetched like so:

var post = fetchedComment.get("parent");
post.fetch({
  success: function(post) {
    var title = post.get("title");
  }
});
*/
