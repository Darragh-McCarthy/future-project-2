(function(){
'use strict';

angular.module('myApp')
	.controller('PredictionList', PredictionList);


PredictionList.$inject=['$state','$scope','PredictionService','$stateParams','focusElementById'];
function PredictionList( $state,  $scope,  PredictionService,  $stateParams,  focusElementById) {
	var _this = this;
	_this.expandPrediction = expandPrediction;
	_this.currentTopic = $stateParams.topic;
	_this.currentPage = 0;
	if ($stateParams.page) {
		_this.currentPage = $stateParams.page;
	}
	getPredictions().then(function(predictions) {
		_this.predictions = predictions;
		_this.isLoadingComplete = true;
	});
	function getPredictions() {
		if (_this.currentTopic) {
			return PredictionService.getPredictionsByTopicTitle(_this.currentTopic);	
		} else {
			return PredictionService.getRecentPredictions(_this.currentPage);
		}
	}
	function expandPrediction(expandedPrediction) {
		angular.forEach(_this.predictions, function(eachPrediction){
			eachPrediction.isExpanded = false;
		});
	}

}



})();