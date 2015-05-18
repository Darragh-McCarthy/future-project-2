(function(){
'use strict';


angular
	.module('myApp.sharedServices')
	.factory('ParsePredictionModelService', ParsePredictionModelService);




ParsePredictionModelService.$inject=['_','$q','Parse','ParseTopicModelService','ParseLikelihoodEstimateModelService'];
function ParsePredictionModelService(_, $q,  Parse,  ParseTopicModelService,  ParseLikelihoodEstimateModelService ) {
  
  var ParsePredictionModel = Parse.Object.extend('Prediction');



  var recentPredictionsCache = {};
  var predictionsPerPage = 10;


  return {
    'getRecentPredictions': getRecentPredictions,
    'getPredictionsByTopicTitle': getPredictionsByTopicTitle,
    'getPredictionsByAuthorId': getPredictionsByAuthorId,
    'createNewPredictionWithTopicTitles': createNewPredictionWithTopicTitles,
    'createNewLikelihoodEstimate': createNewLikelihoodEstimate,
  };


  function getRecentPredictions(pagesToSkip, preloadNextPage) {
    pagesToSkip = parseInt(pagesToSkip, 10);
    return $q(function(resolve, reject){

      var indexOfRequestedPage  = pagesToSkip;
      var indexOfNextPage       = pagesToSkip +1;
      var indexOfPreviousPage   = pagesToSkip -1;

      if (recentPredictionsCache[ indexOfRequestedPage ]) {
        resolve(recentPredictionsCache[ indexOfRequestedPage ]);
        if (preloadNextPage) {
          console.log('caching next page');
          getRecentPredictions(indexOfNextPage);
        }
      }
      else if (_.size(recentPredictionsCache) === 0 || ! recentPredictionsCache[ indexOfPreviousPage ] || recentPredictionsCache[ indexOfPreviousPage ].length === predictionsPerPage) {

        var numPredictionsToSkip = pagesToSkip * predictionsPerPage;
        queryParseForRecentPredictions(numPredictionsToSkip).then(function(response){
          if ( ! response || response.error) {
            resolve([]);
          }
          else if (response.length / predictionsPerPage < 1) {
            recentPredictionsCache[ indexOfRequestedPage ] = response;
            resolve(response);
          }
          else {
            var numFullPagesWorthOfPredictions = Math.floor(response.length / predictionsPerPage);
            for (var i = 0; i < numFullPagesWorthOfPredictions; i++) {
              var indexOfEmptyPage = indexOfRequestedPage + i;
              recentPredictionsCache[indexOfEmptyPage] = response.splice(0, predictionsPerPage);
            }
            if (response.length % predictionsPerPage) {
              recentPredictionsCache[indexOfRequestedPage + numFullPagesWorthOfPredictions] = response;
            }
            resolve(recentPredictionsCache[ indexOfRequestedPage ]);

            if (preloadNextPage) {
              console.log('caching next page');
              getRecentPredictions(indexOfNextPage);
            }
            
          }
        });

        for (var i = 0; i < recentPredictionsCache.length; i++) {
          console.log(recentPredictionsCache[i]);
        }

      }
      else {
        resolve([]);
      }
    });
  
  }

  function queryParseForRecentPredictions(numPredictionsToSkip) {
    var query = new Parse.Query(ParsePredictionModel);
    query.include('topics');
    query.descending('createdAt');
    query.skip(numPredictionsToSkip);
    query.limit(10);
    return query.find();
  }


  
  function getPredictionsByAuthorId(authorId) {
    var user = new Parse.User();
    user.id = authorId;
    return getPredictionsByAuthor(user)
  }
  function getPredictionsByAuthor(author) {
    var query = new Parse.Query(ParsePredictionModel);
    query.include('topics');
    query.equalTo('author', author);
    query.descending('createdAt');
    return query.find();
  }
  function getPredictionsByTopicTitle(title) {
    var promise = ParseTopicModelService.promiseTopicByTitle(title);
    return promise.then(getPredictionsByTopic);;
  }
  function getPredictionsByTopic(topic) {
    var query = new Parse.Query(ParsePredictionModel);
    query.include('topics');
    query.equalTo('topics', topic);
    query.descending('createdAt');
    return query.find();
  }

  function createNewPredictionWithTopicTitles(author, predictionTitle, topicTitles) {
    return ParseTopicModelService.promiseGetOrCreateNewTopics(topicTitles).then(function(topics){
      return createNewPrediction(author, predictionTitle, topics);
    });
  }
  function createNewPrediction(author, title, topics) {
    var prediction = new ParsePredictionModel();
    return prediction.save({
      'title': title,
      'topics': topics,
      'author': author
    });
  }
  function createNewLikelihoodEstimate(author, predictionId, percent) {
    var predictionQuery = new Parse.Query(ParsePredictionModel);
    var createEstimatePromise = predictionQuery.get(predictionId).then(function(prediction){
      prediction.increment('percentEstimateCount' + percent);
      return ParseLikelihoodEstimateModelService.addNew(author, prediction, percent).then(function(){
        return prediction;
      });
    });
    return createEstimatePromise;
  }
  



	

}



})();
/*



//You can also link objects using just their objectIds like so:
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

*/
