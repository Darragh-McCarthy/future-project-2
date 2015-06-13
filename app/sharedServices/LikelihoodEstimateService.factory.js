(function(){
'use strict';

angular.module('myApp')
	.factory('LikelihoodEstimateService', LikelihoodEstimateService);

LikelihoodEstimateService.$inject=['$timeout','Parse','$q'];
function LikelihoodEstimateService( $timeout,  Parse,  $q) {
	var ParsePredictionModel = Parse.Object.extend('Prediction');
	console.log('ParsePredictionModel inlined until CommunityLikelihoodEstimateCounterModel can replace it');

	var DELAY_BEFORE_NEW_ESTIMATE_SAVE = 3000;

	var cachedEstimates = {};
	//var cachedEstimateCounts = {};
	var pendingEstimateUpdates = {
		saves: {},
		deletes: {},
		updateTimeouts: {}
	};

	var ParseLikelihoodEstimateModel = Parse.Object.extend('LikelihoodEstimate');

	var whenEstimatesLoaded = new Parse.Query(ParseLikelihoodEstimateModel)
		.equalTo('author', Parse.User.current())
		.limit(1000)
		.find()
		.then(function(parseEstimates) {
			var estimates = castParseLikelihoodEstimatesAsPlainObjects(parseEstimates);
			angular.forEach(estimates, function(estimate) {
				cachedEstimates[estimate.predictionId] = estimate;
			});
		});
	



	return {
		'getUserEstimateForPrediction':getUserEstimateForPrediction,
		'setLikelihoodEstimate': setLikelihoodEstimate//scheduleAddLikelihoodEstimate
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
/*
	function scheduleAddLikelihoodEstimate(predictionId, percent) {
		if (pendingEstimateUpdates.updateTimeouts[predictionId]) {
			pendingEstimateUpdates.updateTimeouts[predictionId].cancel();
		}
		pendingEstimateUpdates.updateTimeouts[predictionId] = $timeout(function(){

			setLikelihoodEstimate(predictionId, percent);
		}, DELAY_BEFORE_NEW_ESTIMATE_SAVE);

		var isNewUpdate = (pendingEstimateUpdates.saves[predictionId] !== percent);
		pendingEstimateUpdates.saves[predictionId] = percent;
		return isNewUpdate;
	}
*/

	function setLikelihoodEstimate(predictionId, percent) {
		var prediction = new ParsePredictionModel({'id': predictionId });
		return addNew(prediction, percent).then(function(newLikelihoodEstimate){
			cachedEstimates[predictionId] = newLikelihoodEstimate;
			return newLikelihoodEstimate;
		});
	}
	function addNew(prediction, percent) {
		var currentParseUser = Parse.User.current();
		if ( ! currentParseUser) {
			return $q.reject();
		}

		var estimate = new ParseLikelihoodEstimateModel();
		var estimateACL = new Parse.ACL(currentParseUser);
		estimateACL.setPublicReadAccess(true);
		estimate.setACL(estimateACL);
		return estimate.save({
			'author': currentParseUser,
			'prediction': prediction,
			'percent': percent
		})
		.then(function(newParseLikelihoodEstimate){
			console.log('newParseLikelihoodEstimate', newParseLikelihoodEstimate);
			return castParseLikelihoodEstimateAsPlainObject(newParseLikelihoodEstimate);
		});
	}

	function castParseLikelihoodEstimateAsPlainObject(parseEstimate) {
		return castParseLikelihoodEstimatesAsPlainObjects([parseEstimate])[0];
	}
	function castParseLikelihoodEstimatesAsPlainObjects(parseEstimates) {
		return parseEstimates.map(function(parseEstimate){
			return {
				'id': parseEstimate.id,
				'authorId': parseEstimate.get('author').id,
				'predictionId': parseEstimate.get('prediction').id,
				'percent': parseEstimate.get('percent')
			};
		});
	}



}


})();