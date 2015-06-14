(function(){
'use strict';

angular.module('myApp')
	.controller('PredictionList', PredictionList);


PredictionList.$inject=['PredictionService','$stateParams','TopicService'];
function PredictionList( PredictionService,  $stateParams,  TopicService) {
	var _this = this;
	_this.currentTopic = $stateParams.topic;
	_this.currentPage = Number($stateParams.page) || 0;
	_this.topicsCatalog = TopicService.featuredTopicTitles;
		
	(function() {
		if (_this.currentTopic) {
			return PredictionService.getPredictionsByTopicTitle(_this.currentTopic);	
		} else {
			return PredictionService.getRecentPredictions(_this.currentPage);
		}
	})().then(function(paginationObject) {
		_this.paginationObject = paginationObject;
		for (var i = 0; i < _this.paginationObject.predictions.length; i++) {
			(function(paginationObject, i) {
				_this.paginationObject.predictions[i].userEstimatePromise.then(function(userEstimate){
					paginationObject.predictions[i].userEstimate = userEstimate;
				});
			})(_this.paginationObject, i);
		}
	});
}



})();