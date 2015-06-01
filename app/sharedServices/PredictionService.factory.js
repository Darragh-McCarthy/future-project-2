
(function(){
'use strict';

angular.module('myApp')
	.factory('PredictionService', PredictionService);

PredictionService.$inject=['$q','TopicService','LikelihoodEstimateService','UserService'];
function PredictionService( $q,  TopicService,  LikelihoodEstimateService,  UserService ) {

    var ParsePredictionModel = Parse.Object.extend('Prediction');

    var NUM_PREDICTIONS_PER_PARSE_QUERY = 100;
    var PREDICTIONS_PER_PAGE = 20;

    var recentPredictionsCache = {};
    var userProfilesPredictionsCache = {}
    var topicsPredictionsCache = {};

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
        'createNewPredictionWithTopicTitle':createNewPredictionWithTopicTitle,
        'getPredictionsByTopicTitle': getPredictionsByTopicTitle,
        'addLikelihoodEstimate': addLikelihoodEstimate,
        'getPredictionById': getPredictionById,
        'removeLikelihoodEstimate': removeLikelihoodEstimate,
        'getPredictionsByAuthorId': getPredictionsByAuthorId,
        'validateNewPrediction': validateNewPrediction,
        'newPredictionDataConstraints': newPredictionDataConstraints,
        'addTopicByTitleToPrediction': addTopicByTitleToPrediction,
        'removeTopicFromPrediction':removeTopicFromPrediction,
        'deletePredictionById':deletePredictionById
    };

function deletePredictionById(id) {

    return new ParsePredictionModel({'id': id}).destroy().then(function(){
        for (var i = 0; i < recentPredictionsCache.predictions.length; i++) {
            if (recentPredictionsCache.predictions[i].id === id) {
                recentPredictionsCache.predictions.splice(i, 1);
                console.log('successfully removed prediction from recentPredictionsCache');
            }
        } 

    });
}
function getPredictionById (predictionId) {
    return new Parse.Query(ParsePredictionModel)
        .include('topics')
        .include('author')
        .get(predictionId)
        .then(castParsePredictionAsPlainObject);
}




    function getRecentPredictions(pageIndex) {
        return getPredictions(pageIndex, null, recentPredictionsCache, queryParseForRecentPredictions);
    }

    function getPredictions(pageIndex, stopRecursion, predictionsCache, parseQuery) {
        predictionsCache.predictions = predictionsCache.predictions || [];

        var indexOfFirstPrediction = pageIndex * PREDICTIONS_PER_PAGE;
        var nextPageIndex = pageIndex + 1;
        var previousPageIndex = pageIndex - 1;

        return $q.when(updateCache())
            .then(function(){
                var predictionsCopy = angular.copy(
                    predictionsCache.predictions.slice(indexOfFirstPrediction, indexOfFirstPrediction + PREDICTIONS_PER_PAGE)
                );
                var promises;
                if ( ! stopRecursion) {
                    promises = [
                        getPredictions(nextPageIndex, 'stopRecursion', predictionsCache).then(function(paginationObject){
                            if (paginationObject.predictions.length) {
                                return true;
                            }
                        }),
                        getPredictions(previousPageIndex, 'stopRecursion', predictionsCache).then(function(paginationObject){
                            if (paginationObject.predictions.length) {
                                return true;
                            }
                        })
                    ];
                }
                return $q.all(promises).then(function(response) {
                    var paginationObject = {
                        'currentPageIndex': pageIndex,
                        'predictions': predictionsCopy,
                        'predictionsPerPage': PREDICTIONS_PER_PAGE,
                        'nextPageIndex': -1,
                        'previousPageIndex': -1
                    }
                    if (response[0]) { paginationObject.nextPageIndex = nextPageIndex; }
                    if (response[1]) { paginationObject.previousPageIndex = previousPageIndex; }
                    return paginationObject;
                });
            })
            .catch(console.log.bind(console));

        function updateCache() {
            if ( ! predictionsCache.predictions['areAllPredictionsLoaded'] && ! predictionsCache.predictions[indexOfFirstPrediction] ) {
                return $q.when(parseQuery(indexOfFirstPrediction))
                .then(function(response) {
                    if ( ! predictionsCache.predictions['areAllPredictionsLoaded']) {
                        var predictions = castParsePredictionsAsPlainObjects(response.predictions);
                        getUserEstimatesForPredictions(predictions);
                        predictionsCache.predictions = predictionsCache.predictions.concat(predictions);
                        if (response.isRequestQuotaNotReached) {
                            predictionsCache.predictions['areAllPredictionsLoaded'] = true;
                        }
                    }
                });
            }
        }
    }

    function queryParseForRecentPredictions(numPredictionsToSkip) {
        return new Parse.Query(ParsePredictionModel)
            .include('topics')
            .descending('createdAt')
            .skip(numPredictionsToSkip)
            .limit(NUM_PREDICTIONS_PER_PARSE_QUERY)
            .find()
            .then(function(predictions){
                console.log('fetched recent predictions from Parse');
                var response = {
                    predictions: predictions || [],
                }
                if ( ! predictions || predictions.length < NUM_PREDICTIONS_PER_PARSE_QUERY) {
                    response.isRequestQuotaNotReached = true;
                }
                return response;
            });
    }
    function getUserEstimatesForPredictions(predictions) {
        return $q(function(resolve, reject){
            var promises = [];
            for (var i = 0; i < predictions.length; i++) {
                var promise = (function(predictions, i){
                    LikelihoodEstimateService.getUserEstimateForPrediction(predictions[i].id).then(function(userEstimate){
                        predictions[i].userEstimate = userEstimate;
                    });
                })(predictions, i);
                promises.push(promise);
            }
            resolve($q.all(promises));
        });
    }







  function addTopicByTitleToPrediction(predictionId, newTopicTitle) {
    return TopicService.getOrCreateNewTopicsByTitle([newTopicTitle]).then(function(topics){
      if (topics) {
        var prediction = new ParsePredictionModel;
        prediction.id = predictionId;
        prediction.addUnique('topics', topics[0]);
        return prediction.save().then(function(){
          return TopicService.castParseTopicsAsPlainObjects(topics)[0];
        });
      }
    });
  }
  function removeTopicFromPrediction(predictionId, topicId) {
    var topic = TopicService.getEmptyTopicReferenceById(topicId)
    var prediction = new ParsePredictionModel;
    prediction.id = predictionId;
    prediction.remove('topics', topic);
    return prediction.save();
  }







    function getPredictionsByAuthorId(authorId, pageIndex) {
        userProfilesPredictionsCache[authorId] = userProfilesPredictionsCache[authorId] || {};
        return getPredictions(pageIndex, null, userProfilesPredictionsCache[authorId], function(startingIndex){
            return getParsePredictionsByAutherId(authorId, startingIndex);
        });

        return getParsePredictionsByAutherId(authorId);
    }

    function getParsePredictionsByAutherId(id) {
        var author = new Parse.User({id:id});
        return getParsePredictionsByAuthor(author);
    }
    function getParsePredictionsByAuthor(author, numPredictionsToSkip) {
        return new Parse.Query(ParsePredictionModel)
        .include('topics')
        .equalTo('author', author)
        .descending('createdAt')
        .skip(numPredictionsToSkip)
        .limit(NUM_PREDICTIONS_PER_PARSE_QUERY)
        .find()
        .then(function(predictions){
            console.log('fetched predictions by author id from Parse');
            var response = {
                predictions: predictions || []
            }
            if (predictions.length < NUM_PREDICTIONS_PER_PARSE_QUERY) {
                response.isRequestQuotaNotReached = true;
            }
            return response;
        });
    }



  function getPredictionsByTopicTitle(topicTitle) {
    return TopicService.getOrCreateNewTopicsByTitle([topicTitle]).then(function(topics){
        if (topics) {
            var topic = topics[0];
            var pageIndex = 0;
            topicsPredictionsCache[topic.id] = topicsPredictionsCache[topic.id] || [];
            return getPredictions(pageIndex, null, topicsPredictionsCache[topic.id], function(startingIndex){
                        console.log('Parse.Query: ' + topicTitle + ' predictions');
                return getParsePredictionsByTopic(topic, startingIndex);
            });
        } else {
            return;
        }
      });
  }


  function getParsePredictionsByTopic(topic, startingIndex) {
    return new Parse.Query(ParsePredictionModel)
      .include('topics')
      .equalTo('topics', topic)
      .descending('createdAt')
      .skip(startingIndex)
      .limit(NUM_PREDICTIONS_PER_PARSE_QUERY)
      .find()
      .then(function(predictions){

        var response = {
            'predictions':predictions || []
        }
        if (predictions.length < NUM_PREDICTIONS_PER_PARSE_QUERY) {
            response.isRequestQuotaNotReached = true;
        }
        return response;
      })
  }


  function createNewPredictionWithTopicTitle(predictionTitle, topicTitle) {
    return $q(function(resolve, reject) {
      TopicService.getOrCreateNewTopicsByTitle([topicTitle]).then(function(topics){
        if ( ! topics ) {
          reject();
          return;
        }
        else {
          var predictionValidation = validateNewPrediction(predictionTitle);
          var currentUser = Parse.User.current();
          if (currentUser && _.size(predictionValidation) === 0) {
            new ParsePredictionModel().save({
                'title': predictionTitle,
                'author': currentUser,
                'topics': topics
              })
              .then(function(newParsePrediction) {
                var prediction = castParsePredictionAsPlainObject(newParsePrediction, topics);
                addPredictionToCache(prediction);
                resolve(prediction);
              });
          }
          else {
            reject();
            return;
          }
        }
      });
    });
  }
  function createNewPrediction(predictionTitle) {
    return $q(function(resolve, reject) {
      var predictionValidation = validateNewPrediction(predictionTitle);
      var currentUser = Parse.User.current();
      if (currentUser && _.size(predictionValidation) === 0) {
        new ParsePredictionModel().save({
            'title': predictionTitle,
            'author': currentUser,
            'topics': []
          })
          .then(function(newParsePrediction) {
            var prediction = castParsePredictionAsPlainObject(newParsePrediction);
            addPredictionToCache(prediction);
            resolve(prediction);
          });
      }
      else {
        reject();
        return;
      }
    });
  }
  function addLikelihoodEstimate(predictionId, percent) {
    return $q(function(resolve, reject) {
      var currentUser = Parse.User.current();
      var predictionLikelihoodEstimateOptions = [0,10,20,30,40,50,60,70,80,90,100];
      if ( currentUser && predictionLikelihoodEstimateOptions.indexOf(percent) > -1 ) {
        var prediction = new ParsePredictionModel;
        prediction.id = predictionId;
        LikelihoodEstimateService.addNew(currentUser, prediction, percent).then(function(newLikelihoodEstimate){
          prediction.increment('percentEstimateCount' + percent);
          prediction.save().then(function(){
            resolve(newLikelihoodEstimate);
          });
        });
      }
      else {
        reject();
        return;
      }
    });
  }

  function removeLikelihoodEstimate(predictionId, estimateId, percent) {
    return LikelihoodEstimateService.deleteEstimate(estimateId).then(function(newLikelihoodEstimate){
      var prediction = new ParsePredictionModel;
      prediction.id = predictionId;
      prediction.increment('percentEstimateCount' + percent, -1);
      return prediction.save().then(function(){
        return newLikelihoodEstimate;
      });
    });
  }


  function castParsePredictionsAsPlainObjects(parsePredictions) {
    var predictions = [];
    angular.forEach(parsePredictions, function(parsePrediction){
      predictions.push(castParsePredictionAsPlainObject(parsePrediction));
    });
    return predictions;
  }
  function castParsePredictionAsPlainObject(parsePrediction, parseTopics) {
    if ( ! parsePrediction ) return [];

    if ( ! parseTopics ) {
      parseTopics = parsePrediction.get('topics');
    }
    var parseAuthor = parsePrediction.get('author');
    var author = UserService.castParseUserAsPlainObject(parseAuthor);
    var prediction = {
      'id':                       parsePrediction.id,
      'author':                   author,
      'createdAt':                parsePrediction.createdAt,
      'title':                    parsePrediction.get('title'),
      'topics':                   TopicService.castParseTopicsAsPlainObjects(parseTopics),
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




    function addPredictionToCache(prediction) {
        var prediction = angular.copy(prediction);
        prediction.topics.forEach(function(topic){
            if (topicsPredictionsCache[topic.id] && topicsPredictionsCache[topic.id]) {
                topicsPredictionsCache[topic.id].predictions.unshift(prediction);
            }
        });

        if (userProfilesPredictionsCache[prediction.author.id]) {
            userProfilesPredictionsCache[prediction.author.id].predictions.unshift(prediction);
        }
        if (recentPredictionsCache.predictions.length) {
            recentPredictionsCache.predictions.unshift(prediction);
        }
    }



}


})();