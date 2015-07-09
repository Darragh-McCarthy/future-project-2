(function(){
'use strict';

angular.module('myApp')
	.factory('LikelihoodEstimateService', LikelihoodEstimateService);

LikelihoodEstimateService.$inject=['$timeout','Parse','$q','$localForage'];
function LikelihoodEstimateService( $timeout,  Parse,  $q,  $localForage) {
	var Prediction = Parse.Object.extend('Prediction');

	var ParsePredictionModel = Parse.Object.extend('Prediction');
	console.log('ParsePredictionModel inlined until CommunityLikelihoodEstimateCounterModel can replace it');

	//var DELAY_BEFORE_NEW_ESTIMATE_SAVE = 3000;

	var cachedEstimates = {};
	//var cachedEstimateCounts = {};
	/*var pendingEstimateUpdates = {
		saves: {},
		deletes: {},
		updateTimeouts: {}
	};*/

	var ParseLikelihoodEstimateModel = Parse.Object.extend('LikelihoodEstimate');

	var whenEstimatesLoaded = (function(){
		return $localForage.getItem('userLikelihoodEstimates').then(function(localForageEstimates) {
			/*if (localForageEstimates) {
				localForageEstimates.forEach(function(estimate) {
					cachedEstimates[estimate.predictionId] = estimate;
				});
				return;
			}*/
			var query = new Parse.Query(ParseLikelihoodEstimateModel);
			query.equalTo('author', Parse.User.current());
			query.doesNotExist('deleted');
			query.limit(1000);
			return query.find().then(function(parseEstimates) {
				var estimates = castParseLikelihoodEstimatesAsPlainObjects(parseEstimates);
				angular.forEach(estimates, function(estimate) {
					cachedEstimates[estimate.predictionId] = estimate;
				});
				return $localForage.setItem('userLikelihoodEstimates', estimates);
			});
        });
	})();

	return {
		'getUserEstimateForPrediction':getUserEstimateForPrediction,
		'setLikelihoodEstimate': setLikelihoodEstimate,
		'addReason':addReason,
		'getReasonsForPrediction':getReasonsForPrediction,
		'deleteEstimate': deleteEstimate
	};
	function getUserEstimateForPrediction(predictionId) {
		return whenEstimatesLoaded.then(function(){
			return cachedEstimates[predictionId];
		});
	}

	function deleteEstimate(likelihoodEstimateId, predictionId) {
		if (predictionId) {
			return Parse.Cloud.run('deleteLikelihoodEstimateByPredictionId', {
				'predictionId': predictionId
			}).then(
			console.log.bind(console),
				console.log.bind(console));
		}/*
		else if (likelihoodEstimateId) {
			return Parse.Cloud.run('deleteLikelihoodEstimateById', {
				'likelihoodEstimateId': likelihoodEstimateId
			}).then(
				console.log.bind(console),
				console.log.bind(console)
			);
		}*/
			
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
			var newLikelihoodEstimate = castParseLikelihoodEstimateAsPlainObject(newParseLikelihoodEstimate);
			cachedEstimates[predictionId] = newLikelihoodEstimate;
			return newLikelihoodEstimate;
		});
	}

	function addReason(predictionId, reasonText) {
		var currentParseUser = Parse.User.current();
		if ( ! currentParseUser ) {
			return $q.reject();
		}
		var query = new Parse.Query('LikelihoodEstimate');
		var prediction = new Prediction({'id': predictionId});
		query.equalTo('prediction', prediction);
		query.equalTo('author', currentParseUser);
		query.doesNotExist('deleted');

		return query.first().then(function(estimate){
			if (estimate) {
				 console.log('found estimate');
				return estimate.save('reasonText', reasonText);
			}
			else {
				console.log('estimate not found');
			}
		});
	}

	function getReasonsForPrediction(predictionId) {
		var prediction = new Prediction({'id': predictionId});
		var query = new Parse.Query('LikelihoodEstimate');
		query.equalTo('prediction', prediction);
		query.doesNotExist('deleted');
		query.exists('reasonText');
		return query.find().then(function(estimates){
			console.log(estimates);
			return castParseLikelihoodEstimatesAsPlainObjects(estimates);
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
				'percent': parseEstimate.get('percent'),
				'reasonText': parseEstimate.get('reasonText')
			};
		});
	}



}


})();