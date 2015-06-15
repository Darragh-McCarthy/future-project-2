(function(){
'use strict';

angular.module('myApp')
	.controller('fpLikelihoodUserEstimate', fpLikelihoodUserEstimate)
	.directive('fpLikelihoodUserEstimate', function(){
		return {
			templateUrl:'sharedDirectives/fp-likelihood-user-estimate/fp-likelihood-user-estimate.template.html',
			bindToController:true,
			scope:{
				userEstimatePercent: '=',
				onSelectOption: '&'
			},
			controller:'fpLikelihoodUserEstimate as userEstimateCtrl'
		};
	});
	
fpLikelihoodUserEstimate.$inject=[];
function fpLikelihoodUserEstimate( ) {
	var _this = this;
	_this.percentOptions = [100,90,80,70,60,50,40,30,20,10,0];
}


})();