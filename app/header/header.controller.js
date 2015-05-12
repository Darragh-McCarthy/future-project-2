(function(){
'use strict';





angular
	.module('myApp')
	.controller('Header', Header);

Header.$inject=['$state','currentUser'];
function Header( $state, currentUser ) {
	var header = this;
	header.currentUser = currentUser;	
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
	

	
}






})();