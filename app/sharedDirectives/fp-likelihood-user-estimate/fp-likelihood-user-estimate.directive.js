/*(function(){
'use strict';

angular.module('myApp')
	.controller('fpLikelihoodUserEstimate', fpLikelihoodUserEstimate)
	.directive('fpLikelihoodUserEstimate', function(){
		return {
			templateUrl:'sharedDirectives/fp-likelihood-user-estimate/fp-likelihood-user-estimate.template.html',
			bindToController:true,
			scope:{
				prediction: '='
			},
			controller:'fpLikelihoodUserEstimate as estimateOptions'
		};
	});
	
fpLikelihoodUserEstimate.$inject=[];
function fpLikelihoodUserEstimate() {
	var _this = this;

}


})();*/