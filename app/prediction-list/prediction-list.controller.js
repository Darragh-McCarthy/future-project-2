(function(){
'use strict';

angular.module('myApp')
	.controller('PredictionList', PredictionList);


PredictionList.$inject=['$state','$scope','PredictionService','$stateParams','focusElementById','TopicService'];
function PredictionList( $state,  $scope,  PredictionService,  $stateParams,  focusElementById,  TopicService) {
	var _this = this;
	_this.currentTopic = $stateParams.topic;
	_this.currentPage = Number($stateParams.page) || 0;
	
	(function() {
		if (_this.currentTopic) {
			return PredictionService.getPredictionsByTopicTitle(_this.currentTopic);	
		} else {
			return PredictionService.getRecentPredictions(_this.currentPage);
		}
	})().then(function(paginationObject) {
		_this.paginationObject = paginationObject;
	});


}



})();