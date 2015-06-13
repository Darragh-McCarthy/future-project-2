var ReadOnlyPredictionData = Parse.Object.extend('ReadOnlyPredictionData');
var LIKELIHOOD_ESTIMATE_OPTIONS = [0,10,20,30,40,50,60,70,80,90,100];



// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});




Parse.Cloud.beforeSave("Prediction", function(request, response) {
	if ( ! request.object.existed()) {
		return assignReadOnlyPredictionDataObject(request.object).then(function(){
			response.success();
		});
	} else { return response.success(); }
});

Parse.Cloud.afterSave("Prediction", function(request) {
	assignPredictionPointerToReadOnlyPredictionData(request.object);
});

Parse.Cloud.beforeSave('LikelihoodEstimate', function(request, response) {
	if (LIKELIHOOD_ESTIMATE_OPTIONS.indexOf(request.object.get('percent')) === -1) {
		return response.error('LikelihoodEstimate.percent should be one of the following: ' + LIKELIHOOD_ESTIMATE_OPTIONS.join(', '));
	}
	var isLikelihoodEstimateExists = !! request.object.createdAt;
	return response.success();
});



Parse.Cloud.afterSave('LikelihoodEstimate', function(request) {
	if ( ! request.object.existed()) {

		var promise = getActiveEstimatesForCurrentPrediction().then(function(estimates) {
			var promises = [];
			for (var i = 0; i < estimates.length; i++) {
				if (estimates[i].id !== request.object.id) {
					estimates[i].set('deleted', true);
					promises.push(estimates[i].save());
				}
			}
			return promises;
		});



		Parse.Cloud.useMasterKey();
		return promise.then(function(deletedEstimatePromises){
			return Parse.Promise.when(deletedEstimatePromises).then(function(deletedEstimates){
				console.log('deletedEstimates');
				console.log(deletedEstimates);
				if ( ! deletedEstimates ) {
					deletedEstimates = [];
				}
				else if ( ! deletedEstimates.length) {
					deletedEstimates = [deletedEstimates];
				}
				var prediction = request.object.get('prediction');
				return prediction.fetch().then(function(prediction) {
					var readOnlyPredictionData = prediction.get('readOnlyPredictionData');
					if ( ! request.object.existed()) {
						deletedEstimates.forEach(function(deletedEstimate) {
							var propertyName = 'likelihoodEstimateCountFor' + deletedEstimate.get('percent') + 'Percent';
							readOnlyPredictionData.increment(propertyName, -1);
						});
						readOnlyPredictionData.increment('likelihoodEstimateCountFor' + request.object.get('percent') + 'Percent');	
					}
					return readOnlyPredictionData.save();
				});
			});
				
		});

	}



	function getActiveEstimatesForCurrentPrediction() {
		var query = new Parse.Query('LikelihoodEstimate');
		query.equalTo('author', request.user);
		query.equalTo('prediction', request.object.get('prediction'));
		query.doesNotExist('deleted');
		return query.find().then(function(estimates){
			console.log('estimates.length');
			console.log(estimates.length);
			return estimates;
		});
	}
});











function assignReadOnlyPredictionDataObject(prediction) {
	if (prediction.get('readOnlyPredictionData')) {
		return Parse.Promise.as();
	}
	var readOnlyPredictionData = new ReadOnlyPredictionData();
	var acl = new Parse.ACL();
	acl.setPublicReadAccess(true);
	readOnlyPredictionData.setACL(acl);
	return readOnlyPredictionData.save().then(function(readOnlyPredictionData){
		prediction.set('readOnlyPredictionData', readOnlyPredictionData);
		return;
	});
}
function assignPredictionPointerToReadOnlyPredictionData(prediction) {
	//Add pointer to verify authenticity of relationship between ReadOnlyPredictionData object and author editable Prediction
	Parse.Cloud.useMasterKey()
	var readOnlyPredictionData = prediction.get("readOnlyPredictionData");
	if ( ! readOnlyPredictionData.get('prediction')) {
		readOnlyPredictionData.save({'prediction': prediction});
	}
}
