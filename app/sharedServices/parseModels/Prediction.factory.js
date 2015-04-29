(function(){
'use strict';


angular
	.module('myApp.sharedServices')
	.factory('PredictionService', PredictionService);




PredictionService.$inject=['$q','Parse','TopicService'];
function PredictionService( $q,  Parse,  TopicService ) {
  
	var Prediction = Parse.Object.extend('Prediction');

  return {
    'getSomePredictions': getSomePredictions,
    'addNewPrediction': addNewPrediction,
    'getPredictionsByTopicTitle': getPredictionsByTopicTitle
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

    return prediction;
  }


  function makeParselessTopic (parseTopic) {
    return {
      'title': parseTopic.get('title'),
      'url': parseTopic.get('url')
    };
  }


  function addNewPrediction ( title, topicTitles ) {
    return $q(function(resolve, reject) {

      if (!title && !topicTitles.length) {
        console.log('invalid input; failed to create prediction');
      }
      else {
        TopicService.getOrCreateNewTopics(topicTitles)
          .then(function(topics) {

              console.log('addNewPrediction', topics);

              var newPrediction = new Prediction();

              newPrediction.save({
                'title': title,
                'topics': topics,
                'user': Parse.User.current()
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
      }
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
                console.log(results, results.length);

                resolve(results); 
              },
              error: function(){
                reject();
              }
            });

        });
    });
  }




  function addPercentEstimate(user, predictionId, percentage) {



  
  }

}



})();




/*
  // A complex subclass of Parse.Object
var Monster = Parse.Object.extend("Monster", {
  // Instance methods
  hasSuperHumanStrength: function () {
    return this.get("strength") > 18;
  },
  // Instance properties go in an initialize method
  initialize: function (attrs, options) {
    this.sound = "Rawr"
  }
}, {
  // Class methods
  spawn: function(strength) {
    var monster = new Monster();
    monster.set("strength", strength);
    return monster;
  }
});
 
var monster = Monster.spawn(200);
alert(monster.get('strength'));  // Displays 200.
alert(monster.sound); // Displays Rawr.



var GameScore = Parse.Object.extend("GameScore");
var gameScore = new GameScore();
 
gameScore.set("score", 1337);
gameScore.set("playerName", "Sean Plott");
gameScore.set("cheatMode", false);
 
gameScore.save(null, {
  success: function(gameScore) {
    // Execute any logic that should take place after the object is saved.
    alert('New object created with objectId: ' + gameScore.id);
  },
  error: function(gameScore, error) {
    // Execute any logic that should take place if the save fails.
    // error is a Parse.Error with an error code and message.
    alert('Failed to create new object, with error code: ' + error.message);
  }
});


var GameScore = Parse.Object.extend("GameScore");
var gameScore = new GameScore();
 
gameScore.save({
  score: 1337,
  playerName: "Sean Plott",
  cheatMode: false
}, {
  success: function(gameScore) {
    // The object was saved successfully.
  },
  error: function(gameScore, error) {
    // The save failed.
    // error is a Parse.Error with an error code and message.
  }
});
var GameScore = Parse.Object.extend("GameScore");
var query = new Parse.Query(GameScore);
query.get("xWMyZ4YEGZ", {
  success: function(gameScore) {
    // The object was retrieved successfully.
  },
  error: function(object, error) {
    // The object was not retrieved successfully.
    // error is a Parse.Error with an error code and message.
  }
});

var score = gameScore.get("score");
var playerName = gameScore.get("playerName");
var cheatMode = gameScore.get("cheatMode");
var objectId = gameScore.id;
var updatedAt = gameScore.updatedAt;
var createdAt = gameScore.createdAt;

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
