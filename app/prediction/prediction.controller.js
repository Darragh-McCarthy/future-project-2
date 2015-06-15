(function(){
'use strict';

angular.module('myApp')
	.controller('Prediction', Prediction);

Prediction.$inject=['PredictionService','$stateParams','currentUser','LikelihoodEstimateService'];
function Prediction( PredictionService,  $stateParams,  currentUser,  LikelihoodEstimateService ) {
	scroll(0,0);
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