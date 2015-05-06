(function(){
'use strict';

angular.module('myApp')
	.controller('PredictionList', PredictionList);


PredictionList.$inject=['$timeout','$scope','PredictionService','TopicService','$state','$stateParams','currentUser'];
function PredictionList( $timeout,  $scope,  PredictionService,  TopicService,  $state,  $stateParams,  currentUser ) {

	var predictionList = this;
	predictionList.toggleLikelihoodEstimate = toggleLikelihoodEstimate;
	if ($stateParams.q) {	predictionList.currentTopic = $stateParams.q; } 

	getPredictions()
		.then(function(predictions) {
			angular.forEach(predictions, function(prediction) {
				allocateGraphBarHeights(prediction.communityEstimates);
			});
			predictionList.predictions = predictions;
			predictionList.isLoadingComplete = true;

		})
	;





	function getPredictions() {
		if (predictionList.currentTopic) {
			return PredictionService.getPredictionsByTopicTitle(predictionList.currentTopic);			
		} else {
			return PredictionService.getSomePredictions();
		}
	}

	function toggleLikelihoodEstimate(prediction, percent){
		if (prediction.userEstimate === percent) {
			removeLikelihoodEstimate(prediction, percent);
		} else {
			addLikelihoodEstimate(prediction, percent);
		}
	}


	function addLikelihoodEstimate(prediction, percent) {
		angular.forEach(predictionList.predictions, function(predictionListPrediction){
			predictionListPrediction.isExpanded = false;
		});
		prediction.isExpanded = true;

		PredictionService
			.addLikelihoodEstimate(prediction.id, percent)
			.then(function(updatedPrediction){
				prediction.communityEstimates = updatedPrediction.communityEstimates;
				prediction.communityEstimatesCount = updatedPrediction.communityEstimatesCount;
				prediction.userEstimate = percent;
				allocateGraphBarHeights(prediction.communityEstimates);
				prediction.isExpanded = true;
			})
		;
	}
	function removeLikelihoodEstimate(prediction, percent) {
		prediction.userEstimate = null;
	}

	function allocateGraphBarHeights(communityEstimates) {
		var maximumHeight = 100;
		var minimumHeight = 0;
		var largestCount = 0;

		angular.forEach(communityEstimates, function(estimate) {
			if (estimate.count > largestCount) {
				largestCount = estimate.count;
			}
		});

		angular.forEach(communityEstimates, function(estimate) {
			var graphBarHeight = minimumHeight;
			if (estimate.count > minimumHeight ) {
				graphBarHeight = maximumHeight / largestCount * estimate.count;
			}
			estimate.graphBarHeight = {'height':graphBarHeight + 'px'};
		});

	}



}



})();