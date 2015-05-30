(function(){
'use strict';

angular.module('myApp')
	.directive('fpAddNewPrediction', function() {
	return {
		templateUrl:'sharedDirectives/fp-add-new-prediction/fp-add-new-prediction.template.html',
		scope: {
 			topic: '=',
 			autofocus: '@',
 			onAddNewPredictionSuccess:'&',
 			onSavingNewPrediction:'&',
 			hideLabel:'@'
		},
		bindToController: true,
		controller:'FpAddNewPrediction as makePrediction'
	};
});

angular.module('myApp')
	.controller('FpAddNewPrediction', FpAddNewPrediction);


FpAddNewPrediction.$inject=['$scope','$state','PredictionService','focusElementById','currentUser'];
function FpAddNewPrediction( $scope,  $state,  PredictionService,  focusElementById,  currentUser ) {
	var _this = this;
	_this.isAddingSecondPrediction;
	_this.addNewPrediction = addNewPrediction;
	_this.newPredictionDataConstraints = PredictionService.newPredictionDataConstraints;
	_this.areTitleLengthErrorsVisible = false;
	_this.removeDefaultTopic = removeDefaultTopic;
	_this.currentUser = currentUser;
	_this.newPredictionTitle = '';

	if (_this.autofocus) {
		focusElementById('make-prediction__prediction-title-input');
	}

	$scope.$watch('makePrediction.newPredictionTitle', function(newVal, oldVal){
		_this.predictionValidationErrors = PredictionService.validateNewPrediction(newVal);
	});

	function addNewPrediction(newPredictionTitle, newPredictionTopicTitle) {
		_this.areTitleLengthErrorsVisible = true;
		if ( ! _this.predictionValidationErrors) {
			_this.isSavingPredictions = true;
			_this.newPredictionTitle = '';
			_this.areTitleLengthErrorsVisible = false;
			_this.isAddingSecondPrediction = true;
			_this.onSavingNewPrediction({test:'test'});
			(function() {
				if (newPredictionTopicTitle) {
					return PredictionService.createNewPredictionWithTopicTitle(newPredictionTitle, newPredictionTopicTitle);
				} else {
					return PredictionService.createNewPrediction(newPredictionTitle);
				}
			})().then(function(newlyAddedPrediction){
				_this.onAddNewPredictionSuccess({'newPrediction':newlyAddedPrediction});
			});
		}
	}
	
	function removeDefaultTopic() {
		_this.topic = null;
		$state.go('app.make-prediction');
	}

}

})();