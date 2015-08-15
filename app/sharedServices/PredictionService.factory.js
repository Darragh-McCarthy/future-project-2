(function() {
'use strict';

angular.module('myApp')
	.factory('PredictionService', PredictionService);

PredictionService.$inject = ['UserAuth', '$q'];
function PredictionService(UserAuth, $q) {

    var MIN_PREDICTION_CHARACTER_LENGTH = {
        'val': 10,
        'errorCode': 'minlen',
        'makeErrorMsg': function() {
            return 'Predictions must be ' + this.val + ' characters or longer';
        }
    };
    var MAX_PREDICTION_CHARACTER_LENGTH = {
        'val': 280,
        'errorCode': 'maxlen',
        'makeErrorMsg': function() {
            return 'Predictions cannot be longer than ' + this.val + ' characters';
        }
    };
    var ILLEGAL_PREDICTION_CHARACTERS = [
        {
            'val': '?',
            'errorCode': 'illegalquestion',
            'makeErrorMsg': function() {
                return 'Predictions cannot be questions. ' +
                'Instead, please share what you think WILL happen, ' +
                'and when it will happen.';
            }
        }
    ];

    var newlySavedPredictions = [];
    function removeAnyPredictionsNewlySavedThisSession(predictions) {
        return predictions.filter(function(prediction) {
            return newlySavedPredictions.filter(function(newlySavedPrediction) {
                return prediction.id === newlySavedPrediction.id;
            }).length === 0;
        });
    }

    var predictionsCache = {};

    return {
        'saveNewPrediction': saveNewPrediction,
        'validateNewPrediction': validateNewPrediction,
        'deletePredictionById': deletePredictionById,
        'getRecentPredictions': getRecentPredictions,
        'getPredictionById': getPredictionById,
        'getPredictionsByAuthorId': getPredictionsByAuthorId,
        'getPredictionsByTopicTitle': getPredictionsByTopicTitle,
        'getPossibleImprovementsForNewPrediction': getPossibleImprovementsForNewPrediction,
        'getNewlySavedPredictions': getNewlySavedPredictions,
        'saveNewPredictionWithTopicTitle': saveNewPredictionWithTopicTitle,
        //'addTopicToPrediction': addTopicToPrediction,
        'addTopicByTitleToPrediction': addTopicByTitleToPrediction,
        'removeTopicFromPrediction':removeTopicFromPrediction,
        'getAuthorOfPredictionById': getAuthorOfPredictionById
    };

    function saveNewPrediction(predictionTitle) {
        return Parse.Cloud.run('saveNewPrediction', {
            'predictionTitle': predictionTitle
        }).then(
            function onSuccess(newlySavedPrediction) {
                newlySavedPredictions.unshift(newlySavedPrediction);
                predictionsCache[newlySavedPrediction.id] = angular.copy(newlySavedPrediction);
                return angular.copy(newlySavedPrediction);
            },
            function onError(e) {
                console.error(e);
            }
        );
    }

    function saveNewPredictionWithTopicTitle(predictionTitle, topicTitle) {
        return Parse.Cloud.run('saveNewPredictionWithTopicTitle', {
            'predictionTitle': predictionTitle,
            'topicTitle': topicTitle
        }).then(function onSuccess(newlySavedPrediction) {
            newlySavedPredictions.unshift(newlySavedPrediction);
            predictionsCache[newlySavedPrediction.id] = angular.copy(newlySavedPrediction);
            return angular.copy(newlySavedPrediction);
        }, function(e) { console.error(e); });
    }

    function deletePredictionById(predictionId) {
        return Parse.Cloud.run('deletePrediction', {
            'predictionId': predictionId
        }).then(function() {
            console.warn('need to remove prediction from cache');
        }, function(e) { console.error(e); });
    }

    function getRecentPredictions(numPredictions, numPredictionsToSkip) {
        return Parse.Cloud.run('getRecentPredictions', {
            'numPredictions': numPredictions,
            'numPredictionsToSkip': numPredictionsToSkip
        })
        .then(function(recentPredictions) {
            recentPredictions = removeAnyPredictionsNewlySavedThisSession(recentPredictions);
            recentPredictions.forEach(function(prediction) {
                predictionsCache[prediction.id] = angular.copy(prediction);
            });
            return angular.copy(recentPredictions);
        }, function(e) { console.error(e); });
    }

    function getPredictionById(predictionId) {
        if (predictionsCache[predictionId]) {
            return $q.when(predictionsCache[predictionId]);
        }
        return Parse.Cloud.run('getPredictionById', {
            'predictionId': predictionId
        }).then(function(prediction) {
            predictionsCache[prediction.id] = angular.copy(prediction);
            return prediction;
        }, function(e) { console.error(e); });
    }

    function getAuthorOfPredictionById(predictionId) {
        return Parse.Cloud.run('getAuthorOfPredictionById',  {
            'predictionId': predictionId
        }).then(function(author) {
            console.warn('author not added to cache');
            return author;
        }, function(e) { console.error(e); });
    }

    function getPredictionsByAuthorId(authorId) {
        return Parse.Cloud.run('getPredictionsByAuthorId', {
            'authorId': authorId
        }).then(function(predictions) {
            predictions.forEach(function(prediction) {
                predictionsCache[prediction.id] = angular.copy(prediction);
            });
            predictions = removeAnyPredictionsNewlySavedThisSession(predictions);
            return predictions;
        }, function(e) { console.error(e); });
    }

    function getPredictionsByTopicTitle(topicTitle) {
        return Parse.Cloud.run('getPredictionsByTopicTitle', {
            'topicTitle': topicTitle
        }).then(function(predictions) {
            predictions = removeAnyPredictionsNewlySavedThisSession(predictions);

            predictions.forEach(function(prediction) {
                predictionsCache[prediction.id] = angular.copy(prediction);
            });
            return predictions;
        }, function(e) { console.error(e); });
    }

    function validateNewPrediction(predictionTitle) {

        var errorMessages = [];

        if (typeof predictionTitle === 'undefined') {
            errorMessages.push({
                'errorCode': MIN_PREDICTION_CHARACTER_LENGTH.errorCode,
                'errorMsg': MIN_PREDICTION_CHARACTER_LENGTH.makeErrorMsg()
            });
        } else {
            if (predictionTitle.length > MAX_PREDICTION_CHARACTER_LENGTH.val) {
                errorMessages.push({
                    'errorCode': MAX_PREDICTION_CHARACTER_LENGTH.errorCode,
                    'errorMsg': MAX_PREDICTION_CHARACTER_LENGTH.makeErrorMsg()
                });
            }
            if (predictionTitle.length < MIN_PREDICTION_CHARACTER_LENGTH.val) {
                errorMessages.push({
                    'errorCode': MIN_PREDICTION_CHARACTER_LENGTH.errorCode,
                    'errorMsg': MIN_PREDICTION_CHARACTER_LENGTH.makeErrorMsg()
                });
            }

            ILLEGAL_PREDICTION_CHARACTERS.forEach(function(obj) {
                if (predictionTitle.indexOf(obj.val) > -1) {
                    errorMessages.push({
                        'errorCode': obj.errorCode,
                        'errorMsg': obj.makeErrorMsg()
                    });
                }
            });
        }

        return {
            'errors': errorMessages
        };
    }

    function getPossibleImprovementsForNewPrediction(predictionTitle) {
        var suggestions = [];
        return suggestions;
    }

    function getNewlySavedPredictions(topicTitle) {
        if (!topicTitle) {
            return angular.copy(newlySavedPredictions);
        }
        var predictionsMatchingTopic = newlySavedPredictions.filter(function(prediction) {
            var matchingTopics = prediction.topics.filter(function(topic) {
                return topic.title === topicTitle;
            });
            return !!matchingTopics.length;
        });
        return predictionsMatchingTopic;
    }

    function removeTopicFromPrediction(predictionId, topicId) {
        return Parse.Cloud.run('removeTopicFromPrediction', {
            'predictionId': predictionId,
            'topicId': topicId
        })
        .then(null, function(e) { console.error(e); });
    }

    function addTopicByTitleToPrediction(predictionId, topicTitle) {
        return Parse.Cloud.run('addTopicByTitleToPrediction', {
            'predictionId': predictionId,
            'topicTitle': topicTitle
        })
        .then(function(newTopic) {
            var matchingPrediction = newlySavedPredictions
            .filter(function(prediction) {
                return prediction.id === predictionId;
            })[0];
            if (matchingPrediction) {
                matchingPrediction.topics.push(newTopic);
            }
            return angular.copy(newTopic);
        }, function(e) { console.error(e); });
    }

}

})();
