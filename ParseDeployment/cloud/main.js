var ReadOnlyPredictionData = Parse.Object.extend('ReadOnlyPredictionData');
var LIKELIHOOD_ESTIMATE_OPTIONS = [0,10,20,30,40,50,60,70,80,90,100];
var LikelihoodEstimate = Parse.Object.extend('LikelihoodEstimate');
var Prediction = Parse.Object.extend('Prediction');

/*
Parse.Cloud.define('deleteLikelihoodEstimate', function(request, response) {
	var predictionId = request.params.predictionId;
	var estimateId = request.params.estimateId;

	var promiseGetPrediction = null;
	if (predictionId) {
		promiseGetPrediction = new Prediction({'id':predictionId}).fetch();
	}

	var promiseGetEstimate = null;
	if (estimateId) {
		promiseGetEstimate = new LikelihoodEstimate({'id':estimateId}).fetch();
		if ( ! promiseGetPrediction ) {
			promiseGetPrediction = promiseGetEstimate.then(function(estimate){
				return estimate.get('prediction').fetch();
			});
		}
	}

	var promiseGetEstimatesToDelete = (function(){
		if (promiseGetEstimate) {
			return promiseGetEstimate.then(function(estimate) {
				if (estimate.author.id === request.user.id) {
					return [estimate];
				}
			});
		}
		else if (promiseGetPrediction) {
			return promiseGetPrediction.then(function(prediction){
				return new Parse.Query(LikelihoodEstimate)
					.equalTo('prediction', prediction)
					.equalTo('author', request.user)
					.find();
			});
		}
	})();

	var promiseDeleteEstimates = promiseGetEstimatesToDelete.then(function(estimatesToDelete){
		var promiseDeletes = estimatesToDelete.map(function(estimate){
			return estimate.save({'deleted':true});
		});
		return Parse.Promise.when(promiseDeletes);
	});
	
	return promiseDeleteEstimates.then(function(deletedEstimates){
		if ( ! deletedEstimates.length) {
			deletedEstimates = [deletedEstimates];
		}
		return promiseGetPrediction.then(function(prediction) {
			var readOnlyPredictionData = prediction.get('readOnlyPredictionData');
			deletedEstimates.forEach(function(estimate) {
				var propertyName = makeLikelihoodEstimatePercentCountPropertyName(estimate.get('percent'));
				readOnlyPredictionData.increment(propertyName, -1);
			});
			Parse.Cloud.useMasterKey();
			return readOnlyPredictionData.save().then(function(){
				response.success();
			});
		});
	});
});
*/


Parse.Cloud.define('deleteLikelihoodEstimateByPredictionId', function(request, response) {
	var predictionId = request.params.predictionId;
	
	var promiseGetPrediction = new Prediction({'id':predictionId}).fetch();
	var promiseReadOnlyPredictionData = promiseGetPrediction.then(function(prediction){
		return prediction.get('readOnlyPredictionData');
	});

	var promiseGetEstimatesToDelete = promiseGetPrediction.then(function(prediction){
		return new Parse.Query(LikelihoodEstimate)
			.equalTo('prediction', prediction)
			.equalTo('author', request.user)
			.doesNotExist('deleted')
			.lessThanOrEqualTo('createdAt', new Date())
			.find();
	});

	var promiseDeleteEstimates = promiseGetEstimatesToDelete.then(function(estimatesToDelete){
		return Parse.Promise.when(
			estimatesToDelete.map(function(estimate){
				return estimate.save({'deleted':true});
			})
		);
	});
	
	return promiseDeleteEstimates.then(function(deletedEstimates){
		deletedEstimates = deletedEstimates || [];
		if ( ! deletedEstimates.length) {
			deletedEstimates = [deletedEstimates];
		}
		return promiseReadOnlyPredictionData.then(function(readOnlyPredictionData) {
			deletedEstimates.forEach(function(estimate) {
				var propertyName = makeLikelihoodEstimatePercentCountPropertyName(estimate.get('percent'));
				readOnlyPredictionData.increment(propertyName, -1);
			});
			Parse.Cloud.useMasterKey();
			return readOnlyPredictionData.save().then(function(){
				response.success();
			});
		});
	});
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
	return response.success();
});



/*Parse.Cloud.afterSave('LikelihoodEstimate', function(request) {

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
					deletedEstimates.forEach(function(deletedEstimate) {
						var propertyName = 'likelihoodEstimateCountFor' + deletedEstimate.get('percent') + 'Percent';
						readOnlyPredictionData.increment(propertyName, -1);
					});
					readOnlyPredictionData.increment('likelihoodEstimateCountFor' + request.object.get('percent') + 'Percent');	
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
*/

Parse.Cloud.afterSave('LikelihoodEstimate', function(request) {
	if ( ! request.object.existed()) {

		var promiseFindEstimatesToDelete = getActiveEstimatesForCurrentPrediction().then(function(estimates) {
			var estimates = estimates || [];
			return estimates.filter(function(estimate){
				console.log('estimate ids:');
				console.log(estimate.id);
				console.log(request.object.id);
				console.log(estimate.id !== request.object.id);
				return estimate.id !== request.object.id;
			});
		});
		return promiseFindEstimatesToDelete.then(function(estimatesToDelete) {
			console.log(estimatesToDelete.length);
			var promiseDeleteEstimates = estimatesToDelete.map(function(estimate){
				return estimate.save({'deleted':true});
			});
			return Parse.Promise.when(promiseDeleteEstimates).then(function(){
				return request.object.get('prediction').fetch().then(function(prediction) {
					var readOnlyPredictionData = prediction.get('readOnlyPredictionData');
					estimatesToDelete.forEach(function(estimate) {
						var propertyName = makeLikelihoodEstimatePercentCountPropertyName(estimate.get('percent'));
						readOnlyPredictionData.increment(propertyName, -1);
					});
					console.log('request.object.get("percent")');
					console.log(request.object.get('percent'));
					readOnlyPredictionData.increment(makeLikelihoodEstimatePercentCountPropertyName(request.object.get('percent')));
					Parse.Cloud.useMasterKey();
					return readOnlyPredictionData.save();
				});
			});
		});
	}


	function getActiveEstimatesForCurrentPrediction() {
		return new Parse.Query('LikelihoodEstimate')
			.equalTo('author', request.user)
			.equalTo('prediction', request.object.get('prediction'))
			.doesNotExist('deleted')
			.find();;
	}

});

function makeLikelihoodEstimatePercentCountPropertyName(percent) {
	return 'likelihoodEstimateCountFor' + percent + 'Percent';
}








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
