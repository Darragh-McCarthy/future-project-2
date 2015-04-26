(function(){
'use strict';


angular.module('myApp')
	.controller('MakePrediction', MakePrediction);


MakePrediction.$inject=['Prediction'];
function MakePrediction( Prediction ) {
	var makePrediction = this;

	makePrediction.prediction = {};
	makePrediction.newlyAddedPredictions = [];

	makePrediction.makePrediction = function() {
		var newPrediction = angular.copy(makePrediction.prediction);
		makePrediction.prediction = {};
		makePrediction.newlyAddedPredictions.push(newPrediction);
		Prediction.addNewPrediction(newPrediction.title, newPrediction.topics.split(','));

	};
}








})();


