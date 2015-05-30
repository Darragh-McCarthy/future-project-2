(function(){
'use strict';

angular.module('myApp')
	.factory('ExceptionHandler', ExceptionHandler);

ExceptionHandler.$inject=['$injector'];
function ExceptionHandler( $injector ) {
	return function(exception, cause) {
		var $rootScope = $injector.get('$rootScope');
		$rootScope.errors = $rootScope.errors || [];
		$rootScope.errors.push(exception.message);
		console.log($rootScope.errors);
	};
}


})();