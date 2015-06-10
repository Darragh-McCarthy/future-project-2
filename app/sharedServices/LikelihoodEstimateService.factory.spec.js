describe('LikelihoodEstimateService', function(){

	it('should save LikelihoodEstimate', function(){

	});

	it('should delete LikelihoodEstimate', function(){

	});
});





/*
var mock, notify;
beforeEach(module('myServiceModule'));
beforeEach(function() {
  mock = {alert: jasmine.createSpy()};

  module(function($provide) {
    $provide.value('$window', mock);
  });

  inject(function($injector) {
    notify = $injector.get('notify');
  });
});


  expect(mock.alert).not.toHaveBeenCalled();
  expect(mock.alert).toHaveBeenCalledWith("one\ntwo\nthree");
  expect(mock.alert.callCount).toEqual(2);
  expect(mock.alert.mostRecentCall.args).toEqual(["more\ntwo\nthird"]);
*/

/*
describe('myApp', function(){

	describe('LikelihoodEstimateService', function(){

		var LikelihoodEstimateService;
		var Parse;
		var $q;

		beforeEach(module('myApp'));
		beforeEach(inject(function(_LikelihoodEstimateService_){
			LikelihoodEstimateService = _LikelihoodEstimateService_;
		}));


		beforeEach(inject(function(_$q_){
			$q = _$q_;
			Parse = jasmine.createSpy();
		}))

		it('should set x to 2', function(){
			console.log(LikelihoodEstimateService);
			LikelihoodEstimateService.getUserEstimateForPrediction('someIdGoesHere').then(function(estimate){
				expect(x).toBe(2);
			});
		});
	});

});
*/