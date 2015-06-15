
(function(){
'use strict';

angular.module('myApp')
	.factory('PredictionService', PredictionService);

PredictionService.$inject=['$q','TopicService','LikelihoodEstimateService','UserService'];
function PredictionService( $q,  TopicService,  LikelihoodEstimateService,  UserService ) {


    //var cache = {};



    var ParsePredictionModel = Parse.Object.extend('Prediction');

    var NUM_PREDICTIONS_PER_PARSE_QUERY = 100;
    var PREDICTIONS_PER_PAGE = 40;

    var recentPredictionsCache = {};
    var userProfilesPredictionsCache = {};
    var topicsPredictionsCache = {};

    var newPredictionDataConstraints = {
        predictionTitleCharacters: {
            min: {
                value: 10, getErrorMessage: function() { return 'Your prediction is too short. It must be at least ' + this.value + ' characters long'; }
            },
            max: {
                value: 300, getErrorMessage: function() { return 'Your prediction is too long. It cannot be more than ' + this.value + ' characters long';}
            },
            notAllowed: {
                value: ['?'], getErrorMessage: function() { return 'Predictions cannot be questions.'; }
            }
        }
    };

    return {
        'getRecentPredictions': getRecentPredictions,
        'createNewPrediction': createNewPrediction,
        'createNewPredictionWithTopicTitle':createNewPredictionWithTopicTitle,
        'getPredictionsByTopicTitle': getPredictionsByTopicTitle,
        'getPredictionById': getPredictionById,
        'getPredictionsByAuthorId': getPredictionsByAuthorId,
        'validateNewPrediction': validateNewPrediction,
        'newPredictionDataConstraints': newPredictionDataConstraints,
        'addTopicByTitleToPrediction': addTopicByTitleToPrediction,
        'removeTopicFromPrediction':removeTopicFromPrediction,
        'deletePredictionById':deletePredictionById
    };

    function deletePredictionById(id) {
        //var prediction = new ParsePredictionModel({'id': id});
        /*
        return prediction.destroy().then(function(){
            if (recentPredictionsCache.predictions) {
                for (var i = 0; i < recentPredictionsCache.predictions.length; i++) {
                    if (recentPredictionsCache.predictions[i].id === id) {
                        recentPredictionsCache.predictions.splice(i, 1);
                    }
                }  
            }
        });*/
        //console.log('delete doesn\'t remove from cache');
    }
    
    function getPredictionById (predictionId) {
        /*if (predictionsCache.predictions && predictionsCache.predictions[predictionId]) {
            return $q.when(predictionsCache.predictions[predictionId]);
        }*/

        var userThumbnailUrl;
        var userBigPictureUrl;
        return new Parse.Query(ParsePredictionModel)
            .include('topics')
            .include('author')
            .include('readOnlyPredictionData')
            .get(predictionId)
            .then(function(prediction){
                userThumbnailUrl = prediction.get('author').get('userThumbnailUrl');
                userBigPictureUrl = prediction.get('author').get('userBigPictureUrl');
                return prediction;
            })
            .then(castParsePredictionAsPlainObject)
            .then(function(prediction){
                prediction.author.userThumbnailUrl = userThumbnailUrl;
                prediction.author.userBigPictureUrl = userBigPictureUrl;
                return prediction;
            });
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
                getUserEstimatesForPredictions(predictionsCopy);
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
                    };
                    if (response[0]) { paginationObject.nextPageIndex = nextPageIndex; }
                    if (response[1]) { paginationObject.previousPageIndex = previousPageIndex; }
                    return paginationObject;
                });
            })
            .catch(console.log.bind(console));

        function updateCache() {
            if ( ! predictionsCache.predictions.areAllPredictionsLoaded && ! predictionsCache.predictions[indexOfFirstPrediction] ) {
                return $q.when(parseQuery(indexOfFirstPrediction))
                .then(function(response) {
                    if ( ! predictionsCache.predictions.areAllPredictionsLoaded) {
                        var predictions = castParsePredictionsAsPlainObjects(response.predictions);
                        
                        predictionsCache.predictions = predictionsCache.predictions.concat(predictions);
                        if (response.isRequestQuotaNotReached) {
                            predictionsCache.predictions.areAllPredictionsLoaded = true;
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
                var response = {
                    predictions: predictions || [],
                };
                if ( ! predictions || predictions.length < NUM_PREDICTIONS_PER_PARSE_QUERY) {
                    response.isRequestQuotaNotReached = true;
                }
                return response;
            });
    }
    function getUserEstimatesForPredictions(predictions) {
        return predictions.map(function(prediction){
            prediction.userEstimatePromise = LikelihoodEstimateService.getUserEstimateForPrediction(prediction.id);
            prediction.userEstimatePromise.then(function(userEstimate){
                prediction.userEstimate = userEstimate;
            });
            return prediction;
        });/*
        return $q(function(resolve, reject){
            var promises = [];
            for (var i = 0; i < predictions.length; i++) {
                var promise = (function(predictions, i){
                    LikelihoodEstimateService.getUserEstimateForPrediction(predictions[i].id).then(function(userEstimate){
                        console.log(userEstimate);
                        predictions[i].userEstimate = userEstimate;
                    });
                })(predictions, i);
                promises.push(promise);
            }
            resolve($q.all(promises));
        });*/
    }







    function addTopicByTitleToPrediction(predictionId, newTopicTitle) {
        return TopicService.getOrCreateNewTopicsByTitle([newTopicTitle]).then(function(topics){
            if (topics) {
                var prediction = new ParsePredictionModel();
                prediction.id = predictionId;
                prediction.addUnique('topics', topics[0]);
                return prediction.save().then(function(){
                  return TopicService.castParseTopicsAsPlainObjects(topics)[0];
                });
            }
        });
    }
    function removeTopicFromPrediction(predictionId, topicId) {
        var topic = TopicService.getEmptyTopicReferenceById(topicId);
        var prediction = new ParsePredictionModel();
        prediction.id = predictionId;
        prediction.remove('topics', topic);
        return prediction.save();
    }







    function getPredictionsByAuthorId(authorId, pageIndex) {
        userProfilesPredictionsCache[authorId] = userProfilesPredictionsCache[authorId] || {};
        return getPredictions(pageIndex, null, userProfilesPredictionsCache[authorId], function(startingIndex){
            return getParsePredictionsByAutherId(authorId, startingIndex);
        });

        //return getParsePredictionsByAutherId(authorId);
    }

    function getParsePredictionsByAutherId(id, startingIndex) {
        console.log('pagination not implemented');
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
            var response = {
                predictions: predictions || []
            };
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
            'predictions': predictions || []
        };
        if (predictions.length < NUM_PREDICTIONS_PER_PARSE_QUERY) {
            response.isRequestQuotaNotReached = true;
        }
        return response;
      });
  }


    function createNewPredictionWithTopicTitle(predictionTitle, topicTitle) {
        return $q(function(resolve, reject) {
            TopicService.getOrCreateNewTopicsByTitle([topicTitle]).then(function(topics){
                resolve(createNewPrediction(predictionTitle, topics));
            });
        });
    }
    function createNewPrediction(predictionTitle, topics) {
        var currentParseUser = Parse.User.current();
        if ( ! currentParseUser || _.size(validateNewPrediction(predictionTitle)) > 0 ) {
          return $q.reject();
        }

        var newParsePredictionModel = new ParsePredictionModel();
        newParsePredictionModel.setACL(new Parse.ACL(currentParseUser));
        return newParsePredictionModel.save({
            'title': predictionTitle,
            'author': currentParseUser,
            'topics': topics,
        })
        .then(function(newParsePrediction) {
            var prediction = castParsePredictionAsPlainObject(newParsePrediction, topics);
            addPredictionToCache(prediction);
            return prediction;
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
    if ( ! parsePrediction ){
        return [];
    }

    parseTopics = parseTopics || parsePrediction.get('topics');
    var parseAuthor = parsePrediction.get('author');
    var author = UserService.castParseUserAsPlainObject(parseAuthor);
    //var readOnlyPredictionData = parsePrediction.get('readOnlyPredictionData');

    var prediction = {
      'id':                       parsePrediction.id,
      'author':                   author,
      'createdAt':                parsePrediction.createdAt,
      'title':                    parsePrediction.get('title'),
      'topics':                   TopicService.castParseTopicsAsPlainObjects(parseTopics),
      'communityEstimates':       [],
      //'communityEstimatesCount':  0,
      'readOnlyPredictionData': []
    };
    angular.forEach([100,90,80,70,60,50,40,30,20,10,0], function(percent) {
        var percentEstimateCount = parsePrediction.get('likelihoodEstimateCountFor' + percent + 'Percent');
        if ( ! percentEstimateCount ) {
            percentEstimateCount = 0;
        }
        prediction.communityEstimates.push({'percent':percent, 'count':percentEstimateCount});
        prediction.communityEstimatesCount += percentEstimateCount;
      /*var percentEstimateCount = parsePrediction.get('percentEstimateCount' + percent);
      if ( ! percentEstimateCount ) {
        percentEstimateCount = 0;
      }
      prediction.communityEstimates.push({'percent':percent, 'count':percentEstimateCount});
      prediction.communityEstimatesCount += percentEstimateCount;*/

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
      });
    }
    return errors;
  }




    function addPredictionToCache(prediction) {
        prediction = angular.copy(prediction);
        prediction.topics.forEach(function(topic){
            if (topicsPredictionsCache[topic.id] && topicsPredictionsCache[topic.id]) {
                topicsPredictionsCache[topic.id].predictions.unshift(prediction);
            }
        });

        if (userProfilesPredictionsCache[prediction.author.id]) {
            userProfilesPredictionsCache[prediction.author.id].predictions.unshift(prediction);
        }
        if (recentPredictionsCache.predictions) {
            recentPredictionsCache.predictions.unshift(prediction);
        }
    }



}


})();