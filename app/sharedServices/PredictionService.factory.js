(function(){
'use strict';

angular.module('myApp')
	.factory('PredictionService', PredictionService);

PredictionService.$inject=['$q','ParsePredictionModelService','TopicService'];
function PredictionService( $q,  ParsePredictionModelService,  TopicService ) {

  var predictionDataConstraints = {
    minPredictionTitleCharacters: {
      value: 15,
      makeErrorMessage: function() { return 'Predictions must be at least ' + this.value + ' characters long'; }
    },
    maxPredictionTitleCharacters: {
      value: 300,
      makeErrorMessage: function() { return 'Predictions cannot be more than ' + this.value + ' letters long'; }
    },
    minTopicsPerPrediction: {
      value: 1,
      makeErrorMessage: function() { return 'You must add at least ' + this.value + ' topics'; }
    },
    maxTopicsPerPrediction: {
      value: 5,
      makeErrorMessage: function() { return 'You cannot add more than ' + this.value + ' topics'; }
    },
    minTopicTitleCharacters: {
      value: 2,
      makeErrorMessage: function() { return 'Topics must be at least ' + this.value + ' characters long'; }
    },
    maxTopicTitleCharacters: {
      value: 50,
      makeErrorMessage: function() { return 'Topics cannot be longer than ' + this.value + ' characters'; }
    }
  };




  return {
    'getSomePredictions': getSomePredictions,
    'createNewPrediction': createNewPrediction,
    'getPredictionsByTopicTitle': getPredictionsByTopicTitle,
    'addLikelihoodEstimate': addLikelihoodEstimate,
    'getPredictionsByUserId': getPredictionsByUserId,
    'validatePredictionData': validatePredictionData
  };




  function getSomePredictions() {
    return $q(function(resolve) {
      ParsePredictionModelService.getSomePredictions().then(function(parsePredictions){
        var predictions = castParsePredictionsAsPlainObjects(parsePredictions);
        resolve(predictions);
      });
    });
  }
  function getPredictionsByUserId(authorId) {
    return $q(function(resolve){
      ParsePredictionModelService.getPredictionsByAuthorId(authorId).then(function(parsePredictions){
        var predictions = castParsePredictionsAsPlainObjects(parsePredictions)
        resolve(predictions);
      });
    });
  }
  function getPredictionsByTopicTitle(topicTitle) {
    return $q(function(resolve) {
      ParsePredictionModelService.getPredictionsByTopicTitle(topicTitle).then(function(parsePredictions){
        var predictions = castParsePredictionsAsPlainObjects(parsePredictions);
        resolve(predictions);
      });
    });
  }
  function createNewPrediction( predictionTitle, topicTitles ) {
    return $q(function(resolve, reject) {
      var predictionValidation = validatePredictionData(predictionTitle, topicTitles);
      var currentUser = Parse.User.current();

      if (predictionValidation.numErrors) {
        reject(predictionValidation);
        return;
      }
      if ( ! currentUser) {
        reject();
        return;
      }

      ParsePredictionModelService
        .createNewPredictionWithTopicTitles(currentUser, predictionTitle, topicTitles)
        .then(function(prediction){
          console.log('works');
          resolve(prediction);
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
      'created':                  parsePrediction.createdAt,
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


  
















  function validatePredictionData( predictionTitle, topicTitles ) {
    return {
      'predictionTitleErrors': validatePredictionTitle(predictionTitle),
      'topicTitleErrors': validateTopicTitles(topicTitles),
      'topicCountErrors': validateTopicsCount(topicTitles.length)
    };

  }
  function validateTopicsCount(count) {
    var errors = [];
    if (count < predictionDataConstraints.minTopicsPerPrediction.value) {
      errors.push(predictionDataConstraints.minTopicsPerPrediction.makeErrorMessage());
    }
    if (count > predictionDataConstraints.maxTopicsPerPrediction.value) {
      errors.push(predictionDataConstraints.maxTopicsPerPrediction.makeErrorMessage());
    }
    return errors;
  }
  function validatePredictionTitle( title ) {
    var errors = [];

    if ( ! title || title.length < predictionDataConstraints.minPredictionTitleCharacters.value) {
      errors.push(predictionDataConstraints.minPredictionTitleCharacters.makeErrorMessage());
    }
    else if (title.length > predictionDataConstraints.maxPredictionTitleCharacters.value) {
      errors.push(predictionDataConstraints.maxPredictionTitleCharacters.makeErrorMessage());
    }
    return errors;
  }
  function validateTopicTitles( titles ) {
    var errors = [];
      angular.forEach(titles, function(title) {
        var topicTitleErrors = validateTopicTitle(title);
        if (errors.indexOf(topicTitleErrors) === -1 ) {
          angular.forEach(topicTitleErrors, function(topicTitleError) {
            errors.push(topicTitleError);
          });
        }
      });
    return errors;
  }


  function validateTopicTitle( title ) {
    var errors = [];
    if (title.length < predictionDataConstraints.minTopicTitleCharacters.value) {
      errors.push(predictionDataConstraints.minTopicTitleCharacters.makeErrorMessage())
    }
    else if (title.length > predictionDataConstraints.maxTopicTitleCharacters.value) {
      errors.push(predictionDataConstraints.maxTopicTitleCharacters.makeErrorMessage())
    }
    return errors;
  }










}


})();