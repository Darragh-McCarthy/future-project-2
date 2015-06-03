(function(){
'use strict';

angular.module('myApp')
  .controller('Login', Login);


Login.$inject=['currentUser','$window'];
function Login( currentUser,  $window) {
	var _this = this;
	_this.loginWithFacebook = loginWithFacebook;

	function loginWithFacebook(){
		currentUser.loginWithFacebook().then(function(){
			$window.location.href = '/';
		});
	}
}


})();

