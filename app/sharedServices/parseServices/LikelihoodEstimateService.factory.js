(function(){
'use strict';

angular.module('myApp.sharedServices')
	.factory('LikelihoodEstimateService', LikelihoodEstimateService);

LikelihoodEstimateService.$inject= ['Parse','$q'];
function LikelihoodEstimateService ( Parse,  $q ) {
	var ParseModelLikelihoodEstimate = Parse.Object.extend('LikelihoodEstimate');
	var likelihoodEstimatesForCurrentUser = null;

	return {
		'addNew':addNew,
		'getAllByCurrentUser': getAllByCurrentUser
	}


	function addNew(author, prediction, percent) {
		return $q(function(resolve, reject){
			var currentUser = Parse.User.current();
			if ( ! currentUser) {
				reject();
			}

			var likelihoodEstimate = new ParseModelLikelihoodEstimate();
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
	function getAllByCurrentUser() {
		return $q(function(resolve, reject){
			if (likelihoodEstimatesForCurrentUser) {
				resolve(likelihoodEstimatesForCurrentUser);
			}
			else {

				var currentUser = Parse.User.current();
				if ( ! currentUser ) {
					reject();
				}
				else {
					var query = new Parse.Query(ParseModelLikelihoodEstimate);
					query.equalTo('author', currentUser);
					query.find()
						.then(function(likelihoodEstimates) {
							likelihoodEstimatesForCurrentUser = likelihoodEstimates;
							resolve(likelihoodEstimatesForCurrentUser);
						});
				}
				

			}

		});
	}
}

})();