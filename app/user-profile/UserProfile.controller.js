(function(){
'use strict';

angular.module('myApp')
	.controller('UserProfile', UserProfile);

UserProfile.$inject=['$state','$stateParams','currentUser','PredictionService'];
function UserProfile( $state,  $stateParams,  currentUser,  PredictionService ) {
	var userProfile = this;
	userProfile.predictions = [];
	userProfile.userPhotoUrl = '';
	userProfile.userId = $stateParams.userId;
	userProfile.logout = logout;
	userProfile.expandPrediction = expandPrediction;
	userProfile.getFbData = getFbData;
	userProfile.currentUser = currentUser;

	PredictionService.getPredictionsByUserId($stateParams.userId).then(function(predictions){
		userProfile.predictions = predictions;
	});

	function logout() {
		currentUser.logout();
		$state.go('app.login');
	}
	function expandPrediction(expandedPrediction) {
		angular.forEach(userProfile.predictions, function(eachPrediction){
			eachPrediction.isExpanded = false;
		});
		expandedPrediction.isExpanded = true;
	}
	function getFbData() {
		currentUser.getFbData();
	}

}


})();