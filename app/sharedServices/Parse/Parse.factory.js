(function(){
'use strict';


angular.module('myApp.sharedServices')
	.factory('Parse', ParseService);


ParseService.$inject=['$window'];
function ParseService( $window ) {
  $window.Parse.initialize('tkoete7doYZNLOPCt3rL251l69WBSNlbwk4PAJ3L', 'ig9sn2CYO4JUeFAJSG8TTZa4NmRwrG4Iq2VRmhhD');
	return $window.Parse;
}






})();


