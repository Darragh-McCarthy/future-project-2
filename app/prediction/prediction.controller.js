(function(){
'use strict';

angular.module('myApp')
	.controller('Prediction', Prediction);

Prediction.$inject=['PredictionService','$stateParams','currentUser','LikelihoodEstimateService'];
function Prediction( PredictionService,  $stateParams,  currentUser,  LikelihoodEstimateService ) {
	scroll(0,0);
	var _this = this;
	_this.toggleLikelihoodEstimate = toggleLikelihoodEstimate;

	PredictionService.getPredictionById($stateParams.predictionId).then(function(prediction){
		_this.prediction = prediction;
	});
	LikelihoodEstimateService.getReasonsForPrediction($stateParams.predictionId).then(function(likelihoodEstimatesWithReasons) {
		_this.reasons = likelihoodEstimatesWithReasons;
	});

	//DUPLICATE FUNCTIONALITY IN fp-prediction.directive.js
	function toggleLikelihoodEstimate(percent){
        percent = parseInt(percent, 10);

        if (_this.prediction.userEstimate && _this.prediction.userEstimate.percent === percent) {
            LikelihoodEstimateService.deleteEstimate(_this.prediction.userEstimate.id, _this.prediction.id);
            _this.prediction.communityEstimates.forEach(function(estimate){
                if (estimate.percent === percent) {
                    estimate.count--;
                    _this.prediction.communityEstimatesCount--;
                }
            });
            _this.prediction.userEstimate = null;
        } else {
            LikelihoodEstimateService.setLikelihoodEstimate(_this.prediction.id, percent).then(null,
                function onSetEstimateError() {
                    _this.prediction.userEstimate = null;
                }
            );
            _this.prediction.communityEstimates.forEach(function(estimate){
                if (estimate.percent === percent) {
                    estimate.count++;
                    _this.prediction.communityEstimatesCount++;
                }
                if (_this.prediction.userEstimate && estimate.percent === _this.prediction.userEstimate.percent) {
                    estimate.count--;
                    _this.prediction.communityEstimatesCount--;
                }
            });
            _this.prediction.userEstimate = {'percent': percent};
        }
    }
}

})();