(function(){
'use strict';

angular.module('myApp')
	.factory('LikelihoodEstimateService', LikelihoodEstimateService);

LikelihoodEstimateService.$inject=['Parse','$q'];
function LikelihoodEstimateService( Parse,  $q) {
	var LIKELIHOOD_ESTIMATE_OPTIONS = [0,10,20,30,40,50,60,70,80,90,100];
	var NEW_ESTIMATE_DELAY_BEFORE_SAVE = 5;

	var ParseLikelihoodEstimateModel = Parse.Object.extend('LikelihoodEstimate');
	var prefetchedUserEstimates = {};

	var whenEstimatesLoaded = $q(function(resolve, reject){
		new Parse.Query(ParseLikelihoodEstimateModel)
			.equalTo('author', Parse.User.current())
			.limit(1000)
			.find()
			.then(function(parseEstimates) {
				var estimates = castParseLikelihoodEstimatesAsPlainObject(parseEstimates);
				angular.forEach(estimates, function(estimate) {
					prefetchedUserEstimates[estimate.predictionId] = estimate;
				});
				resolve();
			});
	});
	
	var requestsToAddEstimate = {};


	return {
		'getUserEstimateForPrediction':getUserEstimateForPrediction,
        'addLikelihoodEstimate': addLikelihoodEstimate,
        'removeLikelihoodEstimate': removeLikelihoodEstimate
	}


	function addLikelihoodEstimate(predictionId, percent) {
		if ( ! requestsToAddEstimate[predictionId]) {
			requestsToAddEstimate[predictionId] = percent;
		}
		/*
		.save().then(function(newLikelihoodEstimate){
			if (requestsToAddEstimate[predictionId] === newLikelhoodEstimate.percent) {
				requestsToAddEstimate[predictionId] = percent;
			}
		})
		*/



	    return $q(function(resolve, reject) {
			var currentUser = Parse.User.current();
			if ( ! currentUser || LIKELIHOOD_ESTIMATE_OPTIONS.indexOf(percent) === -1 ) {
				return reject();
			}
			console.log('ParsePredictionModel inlined until CommunityLikelihoodEstimateCounterModel can replace it');
			var ParsePredictionModel = Parse.Object.extend('Prediction');
			var prediction = new ParsePredictionModel;
			prediction.id = predictionId;
			addNew(currentUser, prediction, percent).then(function(newLikelihoodEstimate){
				prediction.increment('percentEstimateCount' + percent);
				prediction.save().then(function(){
					resolve(newLikelihoodEstimate);
				});
			});
	    });
	}
	function addNew(author, prediction, percent) {
		var currentUser = Parse.User.current();
		return $q(function(resolve, reject){
			var estimateACL = new Parse.ACL(currentUser);
			estimateACL.setPublicReadAccess(true);
			var estimate = new ParseLikelihoodEstimateModel();
			estimate.setACL(estimateACL);
			estimate.save({
				'author': currentUser, 
				'prediction': prediction, 
				'likelihoodEstimatePercent': percent
			})
			.then(function(newLikelihoodEstimate){
				if (newLikelihoodEstimate && ! newLikelihoodEstimate.errors) {
					resolve(castParseLikelihoodEstimatesAsPlainObject([newLikelihoodEstimate])[0]);
					//prefetchedUserEstimates.push(newLikelihoodEstimate);
				}
				else {
					reject();
				}
			});
		});
	}

	function removeLikelihoodEstimate(predictionId, estimateId, percent) {
		return deleteEstimateById(estimateId).then(function(newLikelihoodEstimate){
			console.log('ParsePredictionModel inlined until CommunityLikelihoodEstimateCounterModel can replace it');
			var ParsePredictionModel = Parse.Object.extend('Prediction');
			var prediction = new ParsePredictionModel;
			prediction.id = predictionId;
			prediction.increment('percentEstimateCount' + percent, -1);
			return prediction.save().then(function(){
				return newLikelihoodEstimate;
			});
		});
	}



	function getUserEstimateForPrediction(predictionId) {
		return whenEstimatesLoaded.then(function(){
			return prefetchedUserEstimates[predictionId];
		});
	}

	function deleteEstimateById(estimateId) {
		var likelihoodEstimate = new ParseLikelihoodEstimateModel;
		likelihoodEstimate.id = estimateId;
		return likelihoodEstimate.destroy();
	}



	function castParseLikelihoodEstimatesAsPlainObject(parseEstimates) {
		var estimates = [];
		angular.forEach(parseEstimates, function(parseEstimate){
			var estimate = {
				'id': parseEstimate.id,
				'authorId': parseEstimate.get('author').id,
				'predictionId': parseEstimate.get('prediction').id,
				'likelihoodEstimatePercent': parseEstimate.get('likelihoodEstimatePercent')
			};
			estimates.push(estimate);
		});
		return estimates;
	}



}


})();