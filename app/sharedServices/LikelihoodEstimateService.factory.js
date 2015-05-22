(function(){
'use strict';

angular.module('myApp')
	.factory('LikelihoodEstimateService', LikelihoodEstimateService);

LikelihoodEstimateService.$inject=['Parse','$q'];
function LikelihoodEstimateService( Parse,  $q) {
	var ParseLikelihoodEstimateModel = Parse.Object.extend('LikelihoodEstimate');
	var cachedUserEstimates = {};


	var whenEstimatesLoaded = (function get1000LikelihoodEstimateAuthoredByCurrentUser() {
		return $q(function(resolve, reject){
			var currentUser = Parse.User.current();
			if ( ! currentUser ) {
				reject();
				return;
			} 
			else {
				new Parse.Query(ParseLikelihoodEstimateModel)
					.equalTo('author', currentUser)
					.limit(1000)
					.find()
					.then(function(parseEstimates) {
						var estimates = castParseLikelihoodEstimatesAsPlainObject(parseEstimates);
						angular.forEach(estimates, function(estimate) {
							cachedUserEstimates[estimate.predictionId] = estimate;
						});
						resolve();
					});
			}
		})
	})();


	return {
		'addNew':addNew,
		'deleteEstimate':deleteEstimateById,
		'getUserEstimateForPrediction':getUserEstimateForPrediction
	}


	
	function getUserEstimateForPrediction(predictionId) {
		return whenEstimatesLoaded.then(function(){
			return cachedUserEstimates[predictionId];
		});
	}

	function deleteEstimateById(estimateId) {
		var likelihoodEstimate = new ParseLikelihoodEstimateModel;
		likelihoodEstimate.id = estimateId;
		return likelihoodEstimate.destroy();
	}

	function addNew(author, prediction, percent) {
		return $q(function(resolve, reject){
			new ParseLikelihoodEstimateModel().save({
					'author':author, 
					'prediction':prediction, 
					'likelihoodEstimatePercent':percent
				})
				.then(function(newLikelihoodEstimate){
					if (newLikelihoodEstimate && ! newLikelihoodEstimate.errors) {
						resolve(castParseLikelihoodEstimatesAsPlainObject([newLikelihoodEstimate])[0]);
						//cachedUserEstimates.push(newLikelihoodEstimate);
					}
					else {
						reject();
					}
				})
			;
		});
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