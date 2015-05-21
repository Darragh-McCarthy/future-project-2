(function(){
'use strict';

angular.module('myApp')
	.factory('LikelihoodEstimateService', LikelihoodEstimateService);

LikelihoodEstimateService.$inject=['Parse','$q'];
function LikelihoodEstimateService( Parse,  $q) {
	var ParseLikelihoodEstimateModel = Parse.Object.extend('LikelihoodEstimate');
	var likelihoodEstimatesForCurrentUser = [];

	return {
		'addNew':addNew,
		'deleteEstimate':deleteEstimate,
		'getAllByCurrentUser': getAllByCurrentUser
	}

	function deleteEstimate(estimateId) {
		var likelihoodEstimate = new ParseLikelihoodEstimateModel;
		likelihoodEstimate.id = estimateId;
		return likelihoodEstimate.destroy();
	}

	function addNew(author, prediction, percent) {
		return $q(function(resolve, reject){
			var currentUser = Parse.User.current();
			if ( ! currentUser) {
				reject();
			}
			var likelihoodEstimate = new ParseLikelihoodEstimateModel();
			likelihoodEstimate.save({
					'author':currentUser, 
					'prediction':prediction, 
					'likelihoodEstimatePercent':percent
				})
				.then(function(newLikelihoodEstimate){
					if (newLikelihoodEstimate && ! newLikelihoodEstimate.errors) {
						resolve(newLikelihoodEstimate);
						likelihoodEstimatesForCurrentUser.push(newLikelihoodEstimate);
					}
					else {
						reject();
					}
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