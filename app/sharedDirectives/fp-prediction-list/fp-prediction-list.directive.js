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
	_this.removePredictionFromList = removePredictionFromList;

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
	function removePredictionFromList(predictionId) {
		console.log('removing prediction from list');
		var indexToRemove = null;
		for (var i = 0; i < _this.predictions.length; i++) {
			if (_this.predictions[i].id === predictionId) {
				indexToRemove = i;
			}
		}
		if (indexToRemove > -1) {
			_this.predictions.splice(indexToRemove, 1);
			console.log('removed prediction from list');
		}
	}
}


})();