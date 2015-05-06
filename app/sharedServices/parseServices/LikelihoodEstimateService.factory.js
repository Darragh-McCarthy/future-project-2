(function(){
'use strict';

angular.module('myApp.sharedServices')
	.factory('LikelihoodEstimateService', LikelihoodEstimateService);

LikelihoodEstimateService.$inject= ['Parse','$q'];
function LikelihoodEstimateService ( Parse,  $q ) {
	var LikelihoodEstimate = Parse.Object.extend('LikelihoodEstimate');

	return {
		'addNew':addNew
	}


	function addNew(author, prediction, percent) {
		return $q(function(resolve, reject){
			var currentUser = Parse.User.current();
			if ( ! currentUser) {
				reject();
			}

			var likelihoodEstimate = new LikelihoodEstimate();
			likelihoodEstimate
				.save({
					'author':currentUser, 
					'prediction':prediction, 
					'likelihoodEstimatePercent':percent
				})
				.then(function(object){
					console.log('likelihoodEstimate', object);
					resolve();
				})
			;

		});
	}
}

})();