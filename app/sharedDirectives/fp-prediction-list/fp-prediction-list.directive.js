(function(){
'use strict';

angular.module('myApp')
	.directive('fpPredictionList', function(){
		return {
			templateUrl: 'sharedDirectives/fp-prediction-list/fp-prediction-list.template.html',
			bindToController:true,
			controller:'FpPredictionList as list',
			scope: {
				predictions: '=',
				currentTopic: '=',
				showAddPredictionForm: '@'
			},
		}
	})
	.controller('FpPredictionList', FpPredictionList);



FpPredictionList.$inject=[];
function FpPredictionList() {
	var _this = this;
	_this.newlyAddedPredictions = [];
	_this.onAddNewPredictionSuccess = onAddNewPredictionSuccess;
	_this.onSavingNewPrediction = onSavingNewPrediction;
	_this.expandPrediction = expandPrediction;

	function onAddNewPredictionSuccess(prediction) {
		_this.newlyAddedPredictions.unshift(prediction);
		_this.isSavingNewPrediction = false;
	}
	function onSavingNewPrediction() {
		_this.isSavingNewPrediction = true;
	}
	function expandPrediction(expandedPrediction) {
		angular.forEach(_this.predictions, function(eachPrediction){
			eachPrediction.isExpanded = false;
		});
	}
}


})();