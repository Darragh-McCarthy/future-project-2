(function(){
'use strict';


angular.module('myApp')
	.controller('MakePrediction', MakePrediction);


MakePrediction.$inject=['$scope','$window','$state','$stateParams','previousState','TopicService'];
function MakePrediction( $scope,  $window,  $state,  $stateParams,  previousState,  TopicService ) {	
	scroll(0, 0);

	var _this = this;
	_this.goBackToPreviousPage = goBackToPreviousPage;	
	_this.newlyAddedPredictions = [];
	_this.topicSuggestions = angular.copy(TopicService.featuredTopicTitles);
	_this.topicSuggestionsPreviouslySelected = [];
	_this.addSuggestedTopic = addSuggestedTopic;
	_this.topic = $stateParams.topic;
	_this.onAddNewPredictionSuccess = onAddNewPredictionSuccess;
    _this.onSavingNewPrediction = onSavingNewPrediction;

    if (_this.topic) {
    	_this.topicSuggestionsPreviouslySelected.push(_this.topic);
    }

    $scope.$watch('makePrediction.topic', function(newVal, oldVal){
    	if (oldVal) {
    		_this.topicSuggestionsPreviouslySelected.unshift(oldVal);
    	}
    });

	function goBackToPreviousPage() {
		if (previousState) {
			$state.go(previousState.name, previousState.params);
		} else {
			$window.location.href = '/';
		}
	}
	function addSuggestedTopic(list, index) {
		_this.topic = list[index];
		list.splice(index, 1);
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


