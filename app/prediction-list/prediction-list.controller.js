(function(){
'use strict';

angular.module('myApp')
	.controller('PredictionList', PredictionList);


PredictionList.$inject=['PredictionService','TopicService','$state','$stateParams','currentUser'];
function PredictionList( PredictionService,  TopicService,  $state,  $stateParams,  currentUser ) {
	var predictionList = this;
	predictionList.isLoading = true;
	predictionList.currentUser = currentUser;
	predictionList.predictions = [];

	if ($stateParams.q) {
		predictionList.currentTopic = $stateParams.q;
	}


	getPredictions()
		.then(function(predictions) {
			console.log(predictions);
			predictionList.predictions = predictions;
			predictionList.isLoading = false;
		});

	function getPredictions() {
		if (predictionList.currentTopic) {
			return PredictionService.getPredictionsByTopicTitle(predictionList.currentTopic);			
		} else {
			return PredictionService.getSomePredictions();
		}
	}
	

}



})();