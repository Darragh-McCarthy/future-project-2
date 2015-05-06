(function(){
'use strict';


angular.module('myApp')
	.directive('prediction', function() {
		return {
			restrict: 'E',
			template: '',
			link: function(scope, element, attrs) {
				console.log('inside link');
			}
		}
});


})();