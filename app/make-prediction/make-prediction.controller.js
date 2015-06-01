(function(){
'use strict';


angular.module('myApp')
	.controller('MakePrediction', MakePrediction);


MakePrediction.$inject=['$state','$stateParams','previousState','TopicService'];
function MakePrediction( $state,  $stateParams,  previousState,  TopicService ) {	
	var _this = this;
	_this.goBackToPreviousPage = goBackToPreviousPage;	
	_this.newlyAddedPredictions = [];
	_this.topicSuggestions = angular.copy(TopicService.featuredTopicTitles);
	_this.addSuggestedTopic = addSuggestedTopic;
	_this.topic = $stateParams.topic;
	_this.onAddNewPredictionSuccess = onAddNewPredictionSuccess;
    _this.onSavingNewPrediction = onSavingNewPrediction;

	function goBackToPreviousPage() {
		if (previousState) {
			$state.go(previousState.name, previousState.params);
		} else {
			$state.go('app');
		}
	}
	function addSuggestedTopic(index) {
		var topic = _this.topicSuggestions[index];
		_this.topic = topic;
		_this.topicSuggestions.unshift(topic);
		_this.topicSuggestions.splice(index, 1);
	}
	function onSavingNewPrediction(){
		console.log('saving prediction');
		_this.isSavingPredictions = true;
	}
	function onAddNewPredictionSuccess(newPrediction) {
		_this.newlyAddedPredictions.push(newPrediction);
		_this.isSavingPredictions = false;
	}
}









})();


