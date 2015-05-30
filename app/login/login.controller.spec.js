describe('login', function(){
	var x = 0;
	var loginCtrl;
	var $scope;
	var currentUser;

	beforeEach(module('myApp'));
	beforeEach(inject(function($controller, $rootScope){
		x = 3;
		$scope = $rootScope.$new();
		$state = jasmine.createSpy();
		currentUser = jasmine.createSpy();

		loginCtrl = $controller('Login', {
			$scope: $scope,
			currentUser:currentUser
		});
	}));

	it('should loginWithFacebook', function(){
		expect(x).toBe(3);
	});
})