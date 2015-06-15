(function(){
'use strict';

angular.module('myApp')
	.controller('FpLikelihoodCommunityEstimate', FpLikelihoodCommunityEstimate)
	.directive('fpLikelihoodCommunityEstimate', function(){
		return {
			templateUrl: 'sharedDirectives/fp-likelihood-community-estimate/fp-likelihood-community-estimate.template.html',
			scope: {
				communityEstimates: '='
			},
			bindToController: true,
			controller: 'FpLikelihoodCommunityEstimate as communityEstimates'
		};
	})



FpLikelihoodCommunityEstimate.$inject=[];
function FpLikelihoodCommunityEstimate() {
	var _this = this;
	//_this.graphBars = [{'height':'height:55px'},{'height':'height:55px'},{'height':'height:55px'}];
	function allocateGraphBarHeights(communityEstimates) {
		var largestCount = 0;
			angular.forEach(communityEstimates, function(estimate) {
			largestCount = Math.max(largestCount, estimate.count);
		});
		angular.forEach(communityEstimates, function(estimate) {
			var graphBarHeight = MIN_GRAPHBAR_HEIGHT;
			if (estimate.count > 0 ) {
				graphBarHeight = MAX_GRAPHBAR_HEIGHT / largestCount * estimate.count;
			}
			estimate.graphBarHeight = {'height':graphBarHeight + 'px'};
		});
	}
}

})();