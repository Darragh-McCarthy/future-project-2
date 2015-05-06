(function(){
'use strict';





angular
	.module('myApp')
	.config(configureStates)
	.controller('Header', Header);

Header.$inject=['$state','currentUser'];
function Header( $state, currentUser ) {
	var header = this;
	header.currentUser = currentUser;

	header.logout = logout;

	
	header.topics = [
		{'title': 'Technology'},
		{'title': 'Science'},
		{'title': 'Space travel'},
		{'title': 'TV and Film'},
		{'title': 'Medicine'},
		{'title': 'Robotics'},
		{'title': 'Artificial Intelligence'},
		{'title': 'Music'},
		{'title': 'Celebrities'},
		{'title': 'Politics'},
		{'title': 'Startups'},
		{'title': 'Entertainment'}
	];
	

	function logout() {
		currentUser.logout();
		$state.go('app.login');
	}
}



configureStates.$inject=['$stateProvider'];
function configureStates( $stateProvider ){
	$stateProvider
		.state('app.header', {
			url: '/',
			views: {
				'header@': {
					templateUrl: 'header/header.html'
				}
			}
		})
	;
}







})();