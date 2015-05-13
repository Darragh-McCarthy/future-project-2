(function(){
'use strict';

angular.module('myApp.sharedServices')
	.factory('ParseLikelihoodEstimateModelService', ParseLikelihoodEstimateModelService);

ParseLikelihoodEstimateModelService.$inject= ['Parse','$q'];
function ParseLikelihoodEstimateModelService ( Parse,  $q ) {
	var ParseLikelihoodEstimateModel = Parse.Object.extend('LikelihoodEstimate');
	var likelihoodEstimatesForCurrentUser = [];

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

			var likelihoodEstimate = new ParseLikelihoodEstimateModel();
			likelihoodEstimate
				.save({
					'author':currentUser, 
					'prediction':prediction, 
					'likelihoodEstimatePercent':percent
				})
				.then(function(object){
					console.log('likelihoodEstimate', object);
					resolve();

					likelihoodEstimatesForCurrentUser.push(object);
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
					var query = new Parse.Query(ParseLikelihoodEstimateModel);
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