(function(){
'use strict';

angular.module('myApp')
	.controller('PredictionList', PredictionList);


PredictionList.$inject=['PredictionService','TopicService','$state','$stateParams','currentUser'];
function PredictionList( PredictionService,  TopicService,  $state,  $stateParams,  currentUser ) {

	var predictionList = this;
	predictionList.expandPrediction = expandPrediction;
	predictionList.currentTopic = $stateParams.q;

	getPredictions().then(function(predictions) {
		predictionList.predictions = predictions;
		predictionList.isLoadingComplete = true;
	});

	


	function getPredictions() {
		if (predictionList.currentTopic) {
			return PredictionService.getPredictionsByTopicTitle(predictionList.currentTopic);			
		} else {
			return PredictionService.getSomePredictions();
		}
	}
	function expandPrediction(expandedPrediction) {
		angular.forEach(predictionList.predictions, function(eachPrediction){
			eachPrediction.isExpanded = false;
		});
		expandedPrediction.isExpanded = true;
	}

}



})();