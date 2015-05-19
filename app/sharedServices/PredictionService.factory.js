(function(){
'use strict';

angular.module('myApp')
	.factory('PredictionService', PredictionService);

PredictionService.$inject=['$q','ParsePredictionModelService','TopicService'];
function PredictionService( $q,  ParsePredictionModelService,  TopicService ) {

  var newPredictionDataConstraints = {
    predictionTitleCharacters: {
      min: {
        value: 10, getErrorMessage: function() { return 'Your prediction is too short. It must be at least ' + this.value + ' characters long' }
      },
      max: {
        value: 300, getErrorMessage: function() { return 'Your prediction is too long. It cannot be more than ' + this.value + ' characters long'}
      },
      notAllowed: {
        value: ['?'], getErrorMessage: function() { return 'Predictions cannot be questions.' }
      }
    }
  };

  return {
    'getRecentPredictions': getRecentPredictions,
    'createNewPrediction': createNewPrediction,
    'getPredictionsByTopicTitle': getPredictionsByTopicTitle,
    'addLikelihoodEstimate': addLikelihoodEstimate,
    'getPredictionsByUserId': getPredictionsByUserId,
    'validateNewPrediction': validateNewPrediction,
    'newPredictionDataConstraints': newPredictionDataConstraints,
    'addTopicByTitleToPrediction': addTopicByTitleToPrediction
  };

  function addTopicByTitleToPrediction(predictionId, newTopicTitle) {
    return ParsePredictionModelService.addTopicByTitleToPrediction(predictionId, newTopicTitle);
  }
  function getRecentPredictions(pageNumber) {
    return ParsePredictionModelService.getRecentPredictions(pageNumber, true).then(function(parsePredictions){
      return castParsePredictionsAsPlainObjects(parsePredictions);
    });
  }
  function getPredictionsByUserId(authorId) {
    return ParsePredictionModelService.getPredictionsByAuthorId(authorId).then(function(parsePredictions){
      return castParsePredictionsAsPlainObjects(parsePredictions)
    });
  }
  function getPredictionsByTopicTitle(topicTitle) {
    return ParsePredictionModelService.getPredictionsByTopicTitle(topicTitle).then(function(parsePredictions){
      return castParsePredictionsAsPlainObjects(parsePredictions);
    });
  }
  function createNewPrediction(predictionTitle) {
    return $q(function(resolve, reject) {
      var predictionValidation = validateNewPrediction(predictionTitle);
      var currentUser = Parse.User.current();
      if (_.size(predictionValidation) ||  ! currentUser) {
        reject();
        return;
      }
      ParsePredictionModelService.createNewPrediction(currentUser, predictionTitle, []).then(function(prediction){
        resolve(castParsePredictionAsPlainObject(prediction));
      });

    });

  }

  function addLikelihoodEstimate(predictionId, percent) {
    return $q(function(resolve, reject) {
      var predictionLikelihoodEstimateOptions = [0,10,20,30,40,50,60,70,80,90,100];
      if ( predictionLikelihoodEstimateOptions.indexOf(percent) === -1 ) {
        reject();
        return;
      }
      var currentUser = Parse.User.current();
      if ( ! currentUser ) {
        reject();
        return;
      }
      ParsePredictionModelService
        .createNewLikelihoodEstimate(currentUser, predictionId, percent)
        .then(function(parsePrediction){
          resolve(castParsePredictionAsPlainObject(parsePrediction));
        });
    });
  }
  function removeLikelihoodEstimate(estimateId) {
    console.log('remove removeLikelihoodEstimate');
  }


  function castParsePredictionsAsPlainObjects(parsePredictions) {
    var predictions = [];
    angular.forEach(parsePredictions, function(parsePrediction){
      predictions.push(castParsePredictionAsPlainObject(parsePrediction));
    });
    return predictions;
  }
  function castParsePredictionAsPlainObject( parsePrediction ) {
    var prediction = {
      'id':                       parsePrediction.id,
      'createdAt':                parsePrediction.createdAt,
      'title':                    parsePrediction.get('title'),
      'topics':                   TopicService.castParseTopicsAsPlainObjects(parsePrediction.get('topics')),
      'communityEstimates':       [],
      'communityEstimatesCount':  0
    };
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


  




  function validateNewPrediction(predictionTitle) {
    var errors = {};
    var predictionTitleLengthErrors = validateNewPredictionTitleLength(predictionTitle);
    var predictionTitleContentErrors = validateNewPredictionTitleContents(predictionTitle);

    if (predictionTitleLengthErrors.length) { errors.predictionTitleLengthErrors = predictionTitleLengthErrors; }
    if (predictionTitleContentErrors.length) { errors.predictionTitleContentErrors = predictionTitleContentErrors; }

    if (_.size(errors)) {
      return errors;
    } else {
      return null;
    }
  }
  function validateNewPredictionTitleLength(predictionTitle) {
    var errors = [];
    if ( ! predictionTitle || predictionTitle.length < newPredictionDataConstraints.predictionTitleCharacters.min.value) {
      errors.push(newPredictionDataConstraints.predictionTitleCharacters.min.getErrorMessage());
    }
    else if (predictionTitle.length > newPredictionDataConstraints.predictionTitleCharacters.max.value) {
      errors.push(newPredictionDataConstraints.predictionTitleCharacters.max.getErrorMessage());
    }
    return errors;
  }
  function validateNewPredictionTitleContents(predictionTitle) {
    var errors = [];
    if (predictionTitle) { 
      angular.forEach(newPredictionDataConstraints.predictionTitleCharacters.notAllowed.value, function(notAllowedString){
        var index = predictionTitle.indexOf(notAllowedString);
        if (index > -1) {
          errors.push(newPredictionDataConstraints.predictionTitleCharacters.notAllowed.getErrorMessage());
        }
      }) 
    }
    return errors;
  }








}


})();