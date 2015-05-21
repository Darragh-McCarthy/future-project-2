(function(){
'use strict';

angular.module('myApp')
	.directive('fpPredictionList', predictionList);

predictionList.$inject=[];
function predictionList(){
	return {
		link: function() {
			console.log('inside predictionList');
		}
	}
}

})();