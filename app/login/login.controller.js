(function(){
'use strict';

angular.module('myApp')
  .controller('Login', Login);


Login.$inject=['currentUser','$window', '$state'];
function Login( currentUser,  $window, $state) {
	var _this = this;
	_this.loginWithFacebook = loginWithFacebook;

	function loginWithFacebook(){
		currentUser.loginWithFacebook().then(function(){
			//$window.location.href = '/';
			$state.go('app.recent');
		});
	}
}


})();

