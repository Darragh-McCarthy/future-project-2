(function(){
'use strict';


angular.module('myApp')
	.controller('MakePrediction', MakePrediction);


MakePrediction.$inject=['$scope','PredictionService','TopicService','$stateParams','focusElementById'];
function MakePrediction( $scope,  PredictionService,  TopicService,  $stateParams,  focusElementById ) {	
	var _this = this;
	_this.newlyAddedPredictions = [];
	_this.newPrediction = {
		title: '',
		topic: $stateParams.topic
	};
	_this.addNewPrediction	= addNewPrediction;
	_this.newPredictionDataConstraints = PredictionService.newPredictionDataConstraints;
	_this.areTitleLengthErrorsVisible = false;
	_this.removeDefaultTopic = removeDefaultTopic;



	focusElementById('make-prediction__title-input');

	$scope.$watch('makePrediction.newPrediction.title', function(newVal, oldVal){
		_this.predictionValidationErrors = PredictionService.validateNewPrediction(newVal);
	});

	function addNewPrediction(newPredictionTitle, newPredictionTopicTitle) {
		_this.areTitleLengthErrorsVisible = true;
		if ( ! _this.predictionValidationErrors) {
			_this.isSavingPredictions = true;
			_this.newPrediction.title = '';
			_this.areTitleLengthErrorsVisible = false;
			addPrediction().then(function(newlyAddedPrediction){
				_this.newlyAddedPredictions.unshift(newlyAddedPrediction);
				_this.isSavingPredictions = false;
			});
		}
		function addPrediction() {
			if (newPredictionTopicTitle) {
				return PredictionService.createNewPredictionWithTopicTitle(newPredictionTitle, newPredictionTopicTitle);
			} else {
				return PredictionService.createNewPrediction(newPredictionTitle);
			}
		}
	}

	function removeDefaultTopic() {
		_this.newPrediction.topic = null;
	}

}









})();


