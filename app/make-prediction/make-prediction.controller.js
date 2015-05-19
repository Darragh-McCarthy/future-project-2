(function(){
'use strict';


angular.module('myApp')
	.controller('MakePrediction', MakePrediction);


MakePrediction.$inject=['$scope','PredictionService','TopicService','$stateParams','focusElementById'];
function MakePrediction( $scope,  PredictionService,  TopicService,  $stateParams,  focusElementById ) {	
	var _this = this;
	_this.newlyAddedPredictions = [];
	_this.newPrediction = {};
	_this.addNewPrediction	= addNewPrediction;
	_this.newPredictionDataConstraints = PredictionService.newPredictionDataConstraints;
	_this.areTitleLengthErrorsVisible = false;
	//if ($stateParams.topic) {}
	focusElementById('make-prediction__title-input');

	$scope.$watch('makePrediction.newPrediction.title', function(newVal, oldVal){
		_this.predictionValidationErrors = PredictionService.validateNewPrediction(newVal);
	});

	function addNewPrediction(newPredictionTitle) {
		_this.areTitleLengthErrorsVisible = true;
		//_this.predictionValidationErrors = PredictionService.validateNewPrediction(newPredictionTitle);
		if ( ! _this.predictionValidationErrors) {
			_this.newPrediction.title = '';
			PredictionService.createNewPrediction(newPredictionTitle).then(function(newlyAddedPrediction){
				_this.newlyAddedPredictions.push(newlyAddedPrediction);
			});
		}
	}



}









})();


