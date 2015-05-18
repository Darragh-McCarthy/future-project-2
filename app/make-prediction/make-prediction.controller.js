(function(){
'use strict';


angular.module('myApp')
	.controller('MakePrediction', MakePrediction);


MakePrediction.$inject=['PredictionService','TopicService','$stateParams','focusElementById'];
function MakePrediction( PredictionService,  TopicService,  $stateParams,  focusElementById ) {
	
	var newPrediction = {
		title: '',
		topicTitles: []
	};

	var ctrl = this;
	ctrl.newlyAddedPredictions 						= [];
	ctrl.formErrorMessages 								= {};
	ctrl.newPrediction 										= newPrediction;
	ctrl.topic 														= '';
	ctrl.addTopic 												= addTopic;
	ctrl.addTopicFromFormInput 						= addTopicFromFormInput;
	ctrl.removeTopic 											= removeTopic;
	ctrl.makePrediction 									= makePrediction;
	ctrl.minimumTopicCharacters 					= 2;
	ctrl.minimumPredictionTitleCharacters = 10;


	if ($stateParams.topic) {
		ctrl.topic = $stateParams.topic;
	}

	focusElementById('make-prediction__title-input');


	function addTopicFromFormInput() {
		addTopic(ctrl.topic);
		ctrl.topic = '';
		focusElementById('make-prediction__topic-title-input');
	}
	function addTopic(topicTitle) {
		ctrl.formErrorMessages = validatePredictionWithNewTitle(newPrediction.predictionTitle, newPrediction.topicTitles, topicTitle);
		if ( ! ctrl.formErrorMessages.topicTitleErrors.length && ! ctrl.formErrorMessages.topicCountErrors.length && newPrediction.topicTitles.indexOf(ctrl.topicTitle) === -1 ) {
			newPrediction.topicTitles.push(topicTitle);
		}
	}

	function validatePredictionWithNewTitle(predictionTitle, topicTitles, newTopicTitle) {
		var topicTitlesCopy = newPrediction.topicTitles.slice();
		topicTitlesCopy.push(newTopicTitle);
		return PredictionService.validatePredictionData(newPrediction.title,topicTitlesCopy);
	}
	function removeTopic(title) {
		var index = newPrediction.topicTitles.indexOf(title);
		newPrediction.topicTitles.splice(index, 1);
	}
	function makePrediction() {

		/*
		var newPredictionCopy = angular.copy(newPrediction);
		ctrl.formErrorMessages = PredictionService.validatePredictionData(newPredictionCopy.title, newPredictionCopy.topicTitles);

		var errorCount = 0;
		angular.forEach(ctrl.formErrorMessages, function(errorMessageType) {
			errorCount += errorMessageType.length;
		});
		if (errorCount === 0) {
			newPrediction.topicTitles = [];
			newPrediction.title = '';
			PredictionService
				.createNewPrediction(newPredictionCopy.title, newPredictionCopy.topicTitles)
				.then(function(prediction){
					ctrl.newlyAddedPredictions.push(prediction);
				});
		}
		*/




		var prediction = {
      'createdAt':                new Date(),
      'title':                    ctrl.newPrediction.title,
      'topics':                   [],
      'communityEstimates':       [],
      'communityEstimatesCount':  0
    };
    angular.forEach([100,90,80,70,60,50,40,30,20,10,0], function(percent) {
      prediction.communityEstimates.push({'percent':percent, 'count':0});
    });
    ctrl.newlyAddedPredictions.push(prediction);
    ctrl.newPrediction.title = '';
    


	}

}








})();


