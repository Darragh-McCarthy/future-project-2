(function(){
'use strict';

angular.module('myApp')
	.controller('Prediction', Prediction);

Prediction.$inject=['PredictionService','$stateParams','currentUser','LikelihoodEstimateService'];
function Prediction( PredictionService,  $stateParams,  currentUser,  LikelihoodEstimateService ) {
	var _this = this;
	PredictionService.getPredictionById($stateParams.predictionId).then(function(prediction){
		_this.prediction = prediction;
	});
	LikelihoodEstimateService.getReasonsForPrediction($stateParams.predictionId).then(function(likelihoodEstimatesWithReasons) {
		console.log('prediction page reasons: ', likelihoodEstimatesWithReasons);
		_this.reasons = likelihoodEstimatesWithReasons;
	});
}

})();