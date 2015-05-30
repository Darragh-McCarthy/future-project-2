/*describe("fp-likelihood-user-estimate.directive.js", function() {
  var el;
  var expr;
  var $scope;
  beforeEach(function(){
    a = true;
  });
  beforeEach(inject(function($compile, $rootScope) {
  	$scope = $rootScope;
  	el = angular.element('<div>{{2 + 2}}</div>');
    elAfterCompile = $compile(el)($rootScope);
  }));
  it("should equal Inside HTML element", function(){
  	expect(el.html()).toBe('{{2 + 2}}');
  });
  describe('compiling of angular.element', function(){
	  it('should be equal to "4"', function(){
	  	$scope.$digest();
	  	expect(elAfterCompile.html()).toBe('3');
	  });
  });
});*/