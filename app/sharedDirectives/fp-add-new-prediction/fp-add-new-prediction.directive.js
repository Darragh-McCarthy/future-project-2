(function(){
'use strict';

angular.module('myApp')
	.directive('fpAddNewPrediction', function() {
	return {
		templateUrl:'sharedDirectives/fp-add-new-prediction/fp-add-new-prediction.template.html',
		scope: {
 			topic: '=',
 			autofocus: '@'
		},
		bindToController: true,
		controller:'FpAddNewPrediction as makePrediction'
	};
});

angular.module('myApp')
	.controller('FpAddNewPrediction', FpAddNewPrediction);


FpAddNewPrediction.$inject=['$scope','$state','PredictionService','focusElementById'];
function FpAddNewPrediction( $scope,  $state,  PredictionService,  focusElementById ) {
	var _this = this;
	_this.newlyAddedPredictions = [];
	_this.addNewPrediction = addNewPrediction;
	_this.newPredictionDataConstraints = PredictionService.newPredictionDataConstraints;
	_this.areTitleLengthErrorsVisible = false;
	_this.removeDefaultTopic = removeDefaultTopic;
	_this.newPrediction = {
		title: '',
		topic: _this.topic
	};

	if (_this.autofocus) {
		focusElementById('make-prediction__prediction-title-input');
	}

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
				_this.newlyAddedPredictions.push(newlyAddedPrediction);
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
		//_this.newPrediction.topic = null;
		$state.go('app.make-prediction');
	}

}

})();