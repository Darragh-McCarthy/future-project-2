(function(){
'use strict';





angular
	.module('myApp')
	.controller('Header', Header);

Header.$inject=['currentUser'];
function Header( currentUser ) {
	var _this = this;
	_this.currentUser = currentUser;	
	_this.topics = [
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