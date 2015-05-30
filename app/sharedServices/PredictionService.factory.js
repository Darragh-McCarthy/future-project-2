
(function(){
'use strict';

angular.module('myApp')
	.factory('PredictionService', PredictionService);

PredictionService.$inject=['$q','TopicService','LikelihoodEstimateService','UserService'];
function PredictionService( $q,  TopicService,  LikelihoodEstimateService,  UserService ) {

    var ParsePredictionModel = Parse.Object.extend('Prediction');
    var PARSE_RECENT_PREDICTIONS_QUERY_LIMIT = 100;
    var recentPredictionsCache = [];
    var isAllRecentPredictionsLoaded = false;
    var predictionsPerPage = 20;

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
        return new ParsePredictionModel({'id': id}).destroy();
    }
    function getPredictionById (predictionId) {
        return new Parse.Query(ParsePredictionModel)
            .include('topics')
            .include('author')
            .get(predictionId)
            .then(castParsePredictionAsPlainObject);
    }



    function getRecentPredictions(pageIndex, stopRecursion) {
        var indexOfFirstPrediction = pageIndex * predictionsPerPage;
        var nextPageIndex = pageIndex + 1;
        var previousPageIndex = pageIndex - 1;

        return $q.when(updateRecentPredictionsCache())
            .then(function(){
                var predictionsCopy = angular.copy(
                    recentPredictionsCache.slice(indexOfFirstPrediction, indexOfFirstPrediction + predictionsPerPage)
                );
                var promises;
                if ( ! stopRecursion) {
                    promises = [
                        getRecentPredictions(nextPageIndex, 'stopRecursion').then(function(paginationObject){
                            if (paginationObject.predictions.length) {
                                return function() {
                                    return getRecentPredictions(nextPageIndex);
                                }
                            }
                        }),
                        getRecentPredictions(previousPageIndex, 'stopRecursion').then(function(paginationObject){
                            if (paginationObject.predictions.length) {
                                return function() {
                                    return getRecentPredictions(previousPageIndex);
                                }
                            }
                        })
                    ];
                }
                return $q.all(promises).then(function(response){
                    var paginationObject = {
                        'currentPageIndex': pageIndex,
                        'predictions': predictionsCopy,
                        'predictionsPerPage': predictionsPerPage,
                        'nextPageIndex': -1,
                        'previousPageIndex': -1
                    }
                    if (response[0]) {
                        paginationObject.nextPageIndex = nextPageIndex;
                    }
                    if (previousPageIndex > -1) {
                        paginationObject.previousPageIndex = previousPageIndex;
                    }
                    return paginationObject;
                });
            })
            .catch(console.log.bind(console));

        function updateRecentPredictionsCache() {
            if ( ! recentPredictionsCache[indexOfFirstPrediction] ) {
                return $q.when(queryParseForRecentPredictions(indexOfFirstPrediction))
                .then(castParsePredictionsAsPlainObjects)
                .then(function(predictions) {
                    getUserEstimatesForPredictions(predictions);
                    recentPredictionsCache = recentPredictionsCache.concat(predictions);
                });
            }
        }
    }

    function queryParseForRecentPredictions(numPredictionsToSkip) {
        if (isAllRecentPredictionsLoaded) {
            return [];
        } else {
            console.log('fetching predictions from parse');
            return new Parse.Query(ParsePredictionModel)
                .include('topics')
                .descending('createdAt')
                .skip(numPredictionsToSkip)
                .limit(PARSE_RECENT_PREDICTIONS_QUERY_LIMIT)
                .find()
                .then(function(predictions){
                    if ( ! predictions || predictions.length < PARSE_RECENT_PREDICTIONS_QUERY_LIMIT) {
                        isAllRecentPredictionsLoaded = true;
                    }
                    if ( ! predictions) {
                        return [];
                    }
                    return predictions;
                });
        }
        
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
    function getPredictionsByAuthorId(authorId) {
        var author = new Parse.User();
        author.id = authorId;
        return getPredictionsByAuthor(author)
            .then(castParsePredictionsAsPlainObjects)
            .then(function(predictions){
                return getUserEstimatesForPredictions(predictions).then(function(){
                    return predictions;
                });
            });
    }
  function getPredictionsByAuthor(author) {
    var query = new Parse.Query(ParsePredictionModel);
    query.include('topics');
    query.equalTo('author', author);
    query.descending('createdAt');
    return query.find();
  }
  function getPredictionsByTopicTitle(topicTitle) {
    return TopicService.getTopicByTitle(topicTitle)
      .then(getPredictionsByTopic)
      .then(castParsePredictionsAsPlainObjects);
  }
  function getPredictionsByTopic(topic) {
    return new Parse.Query(ParsePredictionModel)
      .include('topics')
      .equalTo('topics', topic)
      .descending('createdAt')
      .find();
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
                resolve(castParsePredictionAsPlainObject(newParsePrediction, topics));
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
            resolve(castParsePredictionAsPlainObject(newParsePrediction));
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








}


})();