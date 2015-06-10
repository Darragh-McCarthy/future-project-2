(function(){
'use strict';

angular.module('myApp')
	.factory('LikelihoodEstimateService', LikelihoodEstimateService);

LikelihoodEstimateService.$inject=['$timeout','Parse','$q'];
function LikelihoodEstimateService( $timeout,  Parse,  $q) {
	var ParsePredictionModel = Parse.Object.extend('Prediction');
	console.log('ParsePredictionModel inlined until CommunityLikelihoodEstimateCounterModel can replace it');

	var LIKELIHOOD_ESTIMATE_OPTIONS = [0,10,20,30,40,50,60,70,80,90,100];
	var DELAY_BEFORE_NEW_ESTIMATE_SAVE = 3000;

	var cachedEstimates = {};
	//var cachedEstimateCounts = {};
	var pendingEstimateUpdates = {
		saves: {},
		deletes: {},
		updateTimeouts: {}
	};

	var ParseLikelihoodEstimateModel = Parse.Object.extend('LikelihoodEstimate');

	var whenEstimatesLoaded = $q(function(resolve, reject){
		new Parse.Query(ParseLikelihoodEstimateModel)
			.equalTo('author', Parse.User.current())
			.limit(1000)
			.find()
			.then(function(parseEstimates) {
				var estimates = castParseLikelihoodEstimatesAsPlainObject(parseEstimates);
				angular.forEach(estimates, function(estimate) {
					cachedEstimates[estimate.predictionId] = estimate;
				});
				resolve();
			});
	});
	



	return {
		'getUserEstimateForPrediction':getUserEstimateForPrediction,
		'addLikelihoodEstimate': scheduleAddLikelihoodEstimate
	};
	function getUserEstimateForPrediction(predictionId) {
		return whenEstimatesLoaded.then(function(){
			return cachedEstimates[predictionId];
		});
	}
/*
	function removeLikelihoodEstimate(predictionId, estimateId, percent) {
		var percentEstimateCountPropertyName = 'percentEstimateCount' + percent;
		return $q.all([
			new ParseLikelihoodEstimateModel({'id': estimateId})
				.destroy(),
			new ParsePredictionModel({'id': predictionId})
				.increment(percentEstimateCountPropertyName, -1)
				.save()
		]);
	}
	*/

	function scheduleAddLikelihoodEstimate(predictionId, percent) {
		if (pendingEstimateUpdates.updateTimeouts[predictionId]) {
			pendingEstimateUpdates.updateTimeouts[predictionId].cancel();
		}
		pendingEstimateUpdates.updateTimeouts[predictionId] = $timeout(function(){

			addLikelihoodEstimate(predictionId, percent);
		}, DELAY_BEFORE_NEW_ESTIMATE_SAVE);

		var isNewUpdate = (pendingEstimateUpdates.saves[predictionId] !== percent);
		pendingEstimateUpdates.saves[predictionId] = percent;
		return isNewUpdate;
	}


	function addLikelihoodEstimate(predictionId, percent) {
		var percentEstimateCountPropertyName = 'percentEstimateCount' + percent;
		return $q(function(resolve, reject) {
			var currentUser = Parse.User.current();
			if ( ! currentUser || LIKELIHOOD_ESTIMATE_OPTIONS.indexOf(percent) === -1 ) {
				return reject();
			}
			var prediction = new ParsePredictionModel({'id': predictionId});
			$q.all([
				addNew(currentUser, prediction, percent),
				prediction.increment(percentEstimateCountPropertyName).save()
			]).then(function(responses){
				console.log('added likelihood estimate');
				cachedEstimates[predictionId] = responses[0];
				resolve(responses[0]);
			});
	    });
	}
	function addNew(author, prediction, percent) {
		return $q(function(resolve, reject){
			var currentUser = Parse.User.current();
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
				if (newLikelihoodEstimate) {
					if (newLikelihoodEstimate.errors) {
						reject();
					}
					resolve(castParseLikelihoodEstimatesAsPlainObject([newLikelihoodEstimate])[0]);
				}
			});
		});
	}



	function castParseLikelihoodEstimatesAsPlainObject(parseEstimates) {
		return parseEstimates.map(function(parseEstimate){
			return {
				'id': parseEstimate.id,
				'authorId': parseEstimate.get('author').id,
				'predictionId': parseEstimate.get('prediction').id,
				'likelihoodEstimatePercent': parseEstimate.get('likelihoodEstimatePercent')
			};
		});
	}



}


})();