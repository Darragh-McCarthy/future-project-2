(function(){
'use strict';


angular.module('myApp')
	.controller('MakePrediction', MakePrediction);


MakePrediction.$inject=['PredictionService'];
function MakePrediction( PredictionService ) {
	var makePrediction = this;

	makePrediction.prediction = {};
	makePrediction.newlyAddedPredictions = [];

	makePrediction.makePrediction = function() {
		var newPrediction = angular.copy(makePrediction.prediction);
		makePrediction.prediction = {};

		var topics = newPrediction.topics.split(',');
		
		PredictionService
			.addNewPrediction(newPrediction.title, topics)
			.then(function(){
				makePrediction.newlyAddedPredictions.push(newPrediction);
			});

	};

}








})();


