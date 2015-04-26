(function(){
'use strict';

angular.module('myApp')
	.controller('PredictionList', PredictionList);


PredictionList.$inject=['Prediction','currentUser'];
function PredictionList( Prediction,  currentUser ) {
	var predictionList = this;
	predictionList.isLoading = true;
	predictionList.currentUser = currentUser;
	predictionList.predictions = [];

	Prediction.getSomePredictions()
		.then(function(predictions){
			predictionList.predictions = predictions;
			predictionList.isLoading = false;
		})
	;

}



})();