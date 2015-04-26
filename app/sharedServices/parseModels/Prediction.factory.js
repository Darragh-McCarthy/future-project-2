(function(){
'use strict';


angular
	.module('myApp.sharedServices')
	.factory('Prediction', Prediction);




Prediction.$inject=['$q','parse'];
function Prediction( $q,  parse ) {
  
	var Prediction = parse.Object.extend('Prediction');
  var predictionQuery = new parse.Query(Prediction);

  return {
    'getSomePredictions': getSomePredictions,
    'addNewPrediction': addNewPrediction
  }

  function getSomePredictions() {
    return $q(function(resolve, reject) {
      predictionQuery.find({

        success: function(results) {
          var predictionList = [];
          
          angular.forEach(results, function(object, key) {

            var prediction = {
              'id':                       object.id,
              'created':                  object.createdAt,
              'title':                    object.get('title'),
              'topics':                   object.get('topics'),
              'numStronglyAgreeVotes':    object.get('numStronglyAgreeVotes'),
              'numStronglyDisagreeVotes': object.get('numStronglyDisagreeVotes'),
              'numAgreeVotes':            object.get('numAgreeVotes'),
              'numDisagreeVotes':         object.get('numDisagreeVotes'),
              'numNeitherVotes':          object.get('numNeitherVotes')
            };

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

  function addNewPrediction(title, topics) {
    return $q(function(resolve, reject) {
      if (title && topics.length){
        var prediction = new Prediction();
        prediction.save({
            'title': title,
            'topics': topics,
            'user': parse.User.current()
          })
          .then(
            function(){ console.log('save successful'); },
            function(){ console.log('save failed'); }
          );
      }
      else {
        console.log('invalid input; failed to create prediction');
      }
    });  
  }



  function addVoteOfLikelihood(predictionId, voteTitle) {
/*
    var VoteOfLikelihood = Parse.Object.extend('VoteOfLikelihood');
    voteOfLikelihood = new VoteOfLikelihood();
    voteOfLikelihood.set()

    var prediction = predictionQuery.get( predictionId );
    if (prediction) {

      prediction.increment('completelyLikelyVotesCount');
      prediction.decrement('completelyLikelyVotesCount');



      if ('Completely likely' === ) {
        
      }
      else if ('Very likely') {
        
      }
      else if ('Moderately likely') {
        
      }
      else if ('Slightly likely') {
        
      }
      else if ('Not likely') {
        
      }

    }
*/
  
  }

}

  /*
  var parseObject = parse.Object.extend(
		'Prediction', 
		{
			instanceMethod1: function(){

			},
			instanceMethod2: function(){

			}
		},
		{
			classMethod1:function(){

			},
			classMethod2:function(){

			}
		}
	);
  return {};
  */


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
