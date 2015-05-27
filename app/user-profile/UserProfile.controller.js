(function(){
'use strict';

angular.module('myApp')
	.controller('UserProfile', UserProfile);

UserProfile.$inject=['$state','$stateParams','currentUser','PredictionService','UserService'];
function UserProfile( $state,  $stateParams,  currentUser,  PredictionService,  UserService ) {
	var _this = this;
	_this.predictions = [];
	_this.userPhotoUrl = '';
	_this.userId = $stateParams.userId;
	_this.logout = logout;
	_this.expandPrediction = expandPrediction;
	_this.getFbData = getFbData;
	_this.currentUser = currentUser;
	_this.userToDisplay = undefined;

	UserService.getUserById($stateParams.userId).then(function(user){
		_this.userToDisplay = user;
	});

	PredictionService.getPredictionsByAuthorId($stateParams.userId).then(function(predictions){
		_this.predictions = predictions;
	});

	function logout() {
		currentUser.logout();
		$state.go('app.login');
	}
	function expandPrediction(expandedPrediction) {
		angular.forEach(_this.predictions, function(eachPrediction){
			eachPrediction.isExpanded = false;
		});
		expandedPrediction.isExpanded = true;
	}
	function getFbData() {
		currentUser.getFbData();
	}

}


})();