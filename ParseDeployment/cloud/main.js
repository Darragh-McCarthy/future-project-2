var ReadOnlyPredictionData = Parse.Object.extend('ReadOnlyPredictionData');
var LIKELIHOOD_ESTIMATE_OPTIONS = [0,10,20,30,40,50,60,70,80,90,100];
var LikelihoodEstimate = Parse.Object.extend('LikelihoodEstimate');
var Prediction = Parse.Object.extend('Prediction');


Parse.Cloud.define('deleteLikelihoodEstimate', function(request, response) {
	//response.success("Hello world!");
	var query = new Parse.Query(LikelihoodEstimate);
	if (request.params.estimateId) {
		query.get(request.params.estimateId).then(function(estimate) {
			if (estimate.author.id === request.user.id) {
				return estimate.save({'deleted':true}).then(function(){
					response.success('deleted estimate by id');
				});
			}
			else {
				response.error('cannot delete another user\'s likelihoodEstimate');
			}
		});
	}
	else if (request.params.predictionId) {
		var prediction = new Prediction({
			'id': request.params.predictionId
		});
		query.equalTo('prediction', prediction);
		query.equalTo('author', request.user);
		return query.find().then(
			function onFindEstimatesSuccess(estimates){
				var promiseDeletes = estimates.map(function(estimate){
					return estimate.save({
						'deleted':true
					});
				});
				return Parse.Promise.when(promiseDeletes).then(function(){
					response.success('deleted estimate by query on predictionId, user. Better to delete by likelihoodEstimate id');
				});
			},
			function onFindEstimatesError() {
				response.error('could not find estimates by predictionId, user');
			}
		);
	}
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
