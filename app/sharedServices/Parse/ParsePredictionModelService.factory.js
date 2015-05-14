(function(){
'use strict';


angular
	.module('myApp.sharedServices')
	.factory('ParsePredictionModelService', ParsePredictionModelService);




ParsePredictionModelService.$inject=['$q','Parse','ParseTopicModelService','ParseLikelihoodEstimateModelService'];
function ParsePredictionModelService( $q,  Parse,  ParseTopicModelService,  ParseLikelihoodEstimateModelService ) {
  
  var ParsePredictionModel = Parse.Object.extend('Prediction');

  return {
    'getSomePredictions': getSomePredictions,
    'getPredictionsByTopicTitle': getPredictionsByTopicTitle,
    'getPredictionsByAuthorId': getPredictionsByAuthorId,
    'createNewPredictionWithTopicTitles': createNewPredictionWithTopicTitles,
    'createNewLikelihoodEstimate': createNewLikelihoodEstimate,
  };


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
  function getSomePredictions() {
    var query = new Parse.Query(ParsePredictionModel);
    query.include('topics');
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
