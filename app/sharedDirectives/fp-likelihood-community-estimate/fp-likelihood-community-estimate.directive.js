(function(){
'use strict';

angular.module('myApp')
	.controller('FpLikelihoodCommunityEstimate', FpLikelihoodCommunityEstimate)
	.directive('fpLikelihoodCommunityEstimate', function(){
		return {
			templateUrl: 'sharedDirectives/fp-likelihood-community-estimate/fp-likelihood-community-estimate.template.html',
			scope: {
				communityEstimates: '=',
				communityEstimatesCount: '=',
				userEstimate: '='
			},
			bindToController: true,
			controller: 'FpLikelihoodCommunityEstimate as communityEstimates'
		};
	});



FpLikelihoodCommunityEstimate.$inject=['$scope'];
function FpLikelihoodCommunityEstimate( $scope ) {

    var MAX_GRAPHBAR_HEIGHT = 100;
    var MIN_GRAPHBAR_HEIGHT = 3;

	var _this = this;

	$scope.$watch('communityEstimates.communityEstimates', function(newVal){
		//console.log('new communityEstimates', newVal);
		if (_this.userEstimate) {
			_this.graphBars = allocateGraphBarHeights(_this.communityEstimates, _this.userEstimate.percent);		
		}
	});
	$scope.$watch('communityEstimates.userEstimate', function(newVal){
		//console.log('new userEstimatePercent', _this.communityEstimates);
		if (_this.communityEstimates) {
			var userEstimatePercent = null;
			if (_this.userEstimate) {
				userEstimatePercent = _this.userEstimate.percent;
			}
			_this.graphBars = allocateGraphBarHeights(_this.communityEstimates, userEstimatePercent);
		}
	});

	function allocateGraphBarHeights(communityEstimates, userEstimatePercent) {
		var graphBarHeights = [];
		var largestCount = 0;
			angular.forEach(communityEstimates, function(estimate) {
			var currentCount = estimate.count;
			if (estimate.percent === userEstimatePercent) {
				currentCount++;
			};
			largestCount = Math.max(largestCount, currentCount);
		});
		angular.forEach(communityEstimates, function(estimate) {
			var graphBarHeight = MIN_GRAPHBAR_HEIGHT;
			var currentCount = estimate.count;
			if (userEstimatePercent === estimate.percent) {
				currentCount++;
			}
			if (currentCount > 0 ) {
				graphBarHeight = MAX_GRAPHBAR_HEIGHT / largestCount * currentCount;
			}
			graphBarHeights.push({
				'height':graphBarHeight + 'px'
			});
		});
		console.log(graphBarHeights, communityEstimates, userEstimatePercent);
		return graphBarHeights;
	}
}

})();