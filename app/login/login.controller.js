(function(){
'use strict';



angular
  .module('myApp')
  .controller('Login', Login);


Login.$inject=['$state','currentUser'];
function Login( $state,  currentUser ) {

	var login = this;
	login.loginWithFacebook = loginWithFacebook;

	function loginWithFacebook(){
		currentUser.loginWithFacebook()
			.then(function(){
				$state.go('app');
			})
		;
	}

}





})(); 

