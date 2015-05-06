(function(){
'use strict';


angular.module('myApp')
	.controller('MakePrediction', MakePrediction);


MakePrediction.$inject=['PredictionService','$stateParams'];
function MakePrediction( PredictionService,  $stateParams ) {
	var makePrediction = this;

	makePrediction.prediction = {};
	makePrediction.prediction.topics = $stateParams.topic;
	makePrediction.newlyAddedPredictions = [];

	makePrediction.makePrediction = function() {
		console.log(makePrediction.prediction.topics);
		/*
		var newPrediction = angular.copy(makePrediction.prediction);
		makePrediction.prediction = {};

		var topics = newPrediction.topics.split(',');
		
		PredictionService
			.addNewPrediction(newPrediction.title, topics)
			.then(function(){
				makePrediction.newlyAddedPredictions.push(newPrediction);
			});
		*/

	};

}








})();


