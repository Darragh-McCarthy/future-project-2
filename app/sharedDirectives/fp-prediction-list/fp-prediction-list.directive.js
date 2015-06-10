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
				onClickNextPage: '&',
				onClickPreviousPage: '&',
				showAddPredictionForm: '@',
				paginationObject: '='
			},
		}
	})
	.controller('FpPredictionList', FpPredictionList);





FpPredictionList.$inject=['$scope','$state','$window'];
function FpPredictionList( $scope,  $state,  $window ) {
	$window.scroll(0,0);

	var IS_LARGE_SCREEN_HEIGHT = 500;
	
	var _this = this;
	_this.newlyAddedPredictions = [];
	_this.onAddNewPredictionSuccess = onAddNewPredictionSuccess;
	_this.onSavingNewPrediction = onSavingNewPrediction;
	_this.expandPrediction = expandPrediction;
	_this.removePredictionFromList = removePredictionFromList;
	_this.navigateToPage = navigateToPage;

	$scope.$watch('::list.paginationObject', function(newPaginationObject) {
		if (newPaginationObject) {
			_this.paginationPages = [];
			for (var i = 0; i <= newPaginationObject.currentPageIndex; i++) {
				_this.paginationPages.push({
					'index': i,
					'title': (i + 1)
				});
			}
			if (newPaginationObject.nextPageIndex > -1) {
				_this.paginationPages.push({
					'index': _this.paginationPages.length,
					'title': _this.paginationPages.length + 1
				});	
			}
		}
	});

	function onAddNewPredictionSuccess(prediction) {
		_this.newlyAddedPredictions.unshift(prediction);
		_this.isSavingNewPrediction = false;
	}
	function onSavingNewPrediction() {
		_this.isSavingNewPrediction = true;
	}
	function expandPrediction(expandedPrediction) {
		console.log('FpPredictionList expandPrediction disabled');
		/*_this.paginationObject.predictions.forEach(function(eachPrediction){
			eachPrediction.isExpanded = false;
		});*/
	}
	function removePredictionFromList(predictionId) {
		removePredictionFromArrayByPredictionId(_this.paginationObject.predictions, predictionId);
		removePredictionFromArrayByPredictionId(_this.newlyAddedPredictions, predictionId);
		function removePredictionFromArrayByPredictionId(arrayToSearch, id) {
			var indexToRemove = -1;
			for (var i = 0; i < arrayToSearch.length; i++) {
				if (arrayToSearch[i].id === predictionId) {
					indexToRemove = i;
				}
			}
			if (indexToRemove > -1) {
				arrayToSearch.splice(indexToRemove, 1);
			}
		}
	}
	function navigateToPage(index) {
		$state.go($state.$current.name, { page:index }, { reload:true });
	}
}


})();