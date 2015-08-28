(function() {
'use strict';

angular.module('myApp')
    .factory('JudgementService', JudgementService);

JudgementService.$inject = ['UserAuth', '$q'];
function JudgementService(UserAuth, $q) {

    var LIKELIHOOD_PERCENT_OPTIONS = [
        100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0
    ];

    var allJudgementsForCurrentUserDeferred = $q.defer();
    var allJudgementsForCurrentUser;

    UserAuth.promiseLoginSuccessful.then(function() {
        Parse.Cloud.run('getAllJudgementsForCurrentUser')
        .then(function onSuccess(judgements) {
                allJudgementsForCurrentUser = judgements;
                allJudgementsForCurrentUserDeferred.resolve();
            },
            function(e) { console.error(e); }
        );
    });

    return {
        'getUserJudgementForPrediction': getUserJudgementForPrediction,
        'deleteLikelihoodPercent': deleteLikelihoodPercent,
        'setLikelihoodPercent': setLikelihoodPercent,
        'setReason': setReason,
        'getReasonsForPrediction':getReasonsForPrediction,
        'getJudgementsForPrediction':getJudgementsForPrediction,
        'getLikelihoodPercentOptions': getLikelihoodPercentOptions,
        'saveNewReasonComment': saveNewReasonComment,
        'deleteReasonComment': deleteReasonComment
    };

    function getUserJudgementForPrediction(predictionId) {
        return allJudgementsForCurrentUserDeferred.promise.then(function() {
            var matchingJudgements = allJudgementsForCurrentUser.filter(function(judgement) {
                return predictionId === judgement.predictionId;
            });
            if (!matchingJudgements[0]) {
                return null;
            }
            return angular.copy(matchingJudgements[0]);
        });
    }

    function deleteLikelihoodPercent(predictionId, likelihoodPercent) {
        return Parse.Cloud.run('deleteJudgementLikelihoodPercent', {
            'predictionId': predictionId,
            'likelihoodPercent':likelihoodPercent
        })
        .then(function() {
            for (var i = 0; i < allJudgementsForCurrentUser.length; i++) {
                if (allJudgementsForCurrentUser[i].predictionId === predictionId) {
                    var indexToRemove = allJudgementsForCurrentUser.indexOf(allJudgementsForCurrentUser[i]);
                    allJudgementsForCurrentUser.splice(indexToRemove, 1);
                }
            }
        }, function(e) { console.error(e); });
    }

    function setLikelihoodPercent(predictionId, likelihoodPercent) {
        return Parse.Cloud.run('setJudgementLikelihoodPercent', {
            'predictionId': predictionId,
            'likelihoodPercent': likelihoodPercent
        })
        .then(function(newJudgement) {
            var isExistingJudgementFound = false;
            for (var i = 0; i < allJudgementsForCurrentUser.length; i++) {
                if (allJudgementsForCurrentUser[i].predictionId === predictionId) {
                    allJudgementsForCurrentUser[i].likelihoodPercent = newJudgement.likelihoodPercent;
                    isExistingJudgementFound = true;
                }
            }
            if (!isExistingJudgementFound) {
                allJudgementsForCurrentUser.push(newJudgement);
            }
            newJudgement.author = UserAuth.getCurrentUser();
            return angular.copy(newJudgement);
        }, function(e) { console.error(e); });
    }

    function setReason(judgementId, reasonText) {
        return Parse.Cloud.run('setJudgementReason', {
            'judgementId': judgementId,
            'reasonText': reasonText
        })
        .then(function(newJudgement) {
            newJudgement.author = UserAuth.getCurrentUser();
            for (var i = 0; i < allJudgementsForCurrentUser.length; i++) {
                if (allJudgementsForCurrentUser[i].id === judgementId) {
                    allJudgementsForCurrentUser[i].reasonText = newJudgement.reasonText;
                }
            }
            return angular.copy(newJudgement);
        }, function(e) { console.error(e); });
    }

    function getReasonsForPrediction(predictionId) {
        return Parse.Cloud.run('getReasonsForPrediction', {
            'predictionId': predictionId
        })
        .then(null, function(e) { console.error(e); });
    }

    function getJudgementsForPrediction(predictionId) {
        return Parse.Cloud.run('getJudgementsForPrediction', {
            'predictionId': predictionId
        })
        .then(null, function(e) { console.error(e); });
    }

    function getLikelihoodPercentOptions() {
        return LIKELIHOOD_PERCENT_OPTIONS;
    }

    function saveNewReasonComment(judgementWithReasonId, commentText) {
        return Parse.Cloud.run('saveNewReasonComment', {
            'judgementWithReasonId': judgementWithReasonId,
            'commentText': commentText
        }).then(null, function(e) { console.error(e); });
    }

    function deleteReasonComment(reasonCommentId) {
        return Parse.Cloud.run('deleteReasonComment', {
            'reasonCommentId': reasonCommentId
        }).then(null, function(e) { console.error(e); });
    }

}

})();
