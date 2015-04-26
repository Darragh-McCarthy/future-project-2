(function(){
'use strict';


angular.module('myApp.sharedServices')
	.factory('parse', parse);


parse.$inject=['$window'];
function parse( $window ) {
  $window.Parse.initialize('0nGBcRg8yPjDYH8KzitgIYauoF4ZT6CV369pWPZu', 'P0FjDZHyVrS4ZlxRfrr3FPxsWrtXwLD7v6RFqzIK');
	return $window.Parse;
}






})();


