(function(){
'use strict';

angular.module('myApp')
	.controller('Prediction', Prediction);

Prediction.$inject=['PredictionService','$stateParams','currentUser'];
function Prediction( PredictionService,  $stateParams,  currentUser ) {
	var _this = this;
	PredictionService.getPredictionById($stateParams.predictionId).then(function(prediction){
		_this.prediction = prediction;
	});
}

})();