(function(){
'use strict';


angular.module('myApp')
	.controller('MakePrediction', MakePrediction);


MakePrediction.$inject=['$scope','$window','$state','$stateParams','previousState','TopicService'];
function MakePrediction( $scope,  $window,  $state,  $stateParams,  previousState,  TopicService ) {	
	scroll(0, 0);

	var _this = this;
	_this.newlyAddedPredictions = [];
	_this.topicSuggestions = angular.copy(TopicService.featuredTopicTitles);
	_this.addSuggestedTopicOrGoToTopic = addSuggestedTopicOrGoToTopic;
	_this.topic = $stateParams.topic;
	_this.onAddNewPredictionSuccess = onAddNewPredictionSuccess;
    _this.onSavingNewPrediction = onSavingNewPrediction;
    _this.removePredictionFromList = removePredictionFromList;

    if (_this.topic) {
    	_this.topicSuggestionsPreviouslySelected.push({
    		'title':_this.topic
    	});
    }


    $scope.$watch('makePrediction.topic', function(newVal, oldVal){

    	if (oldVal) {
    		//_this.topicSuggestionsPreviouslySelected.unshift(oldVal);
    		console.log(oldVal);
    		_this.topicSuggestions.forEach(function(topic){
				if (topic.title === oldVal){
					topic.active = false;
					topic.previouslyActive = true;
				}
			});
    	}
    });

	/*
	_this.goBackToPreviousPage = goBackToPreviousPage;
	function goBackToPreviousPage() {
		if (previousState) {
			$state.go(previousState.name, previousState.params);
		} else {
			$window.location.href = '/';
		}
	}*/
	function addSuggestedTopicOrGoToTopic($event, list, index) {
		if (list[index].active) {
			return $state.go('app.topic', {'topic': list[index].title});
		}
		_this.topic = list[index].title;
		list[index].active = true;
   	    _this.setFocusOnPredictionTextInput = true;

	}
	function onSavingNewPrediction(){
		_this.isSavingPredictions = true;
	}
	function onAddNewPredictionSuccess(newPrediction) {
		_this.newlyAddedPredictions.push(newPrediction);
		_this.isSavingPredictions = false;
	}
	function removePredictionFromList(predictionId) {
		for (var i = 0; i < _this.newlyAddedPredictions.length; i++){
			if (_this.newlyAddedPredictions[i].id === predictionId) {
				_this.newlyAddedPredictions.splice(i, 1);
			}
		}
	}
}









})();


