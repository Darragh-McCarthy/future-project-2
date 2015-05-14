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

	var makePredictionCtrl = this;
	makePredictionCtrl.newlyAddedPredictions = [];
	makePredictionCtrl.formErrorMessages = {};
	makePredictionCtrl.newPrediction = newPrediction;
	makePredictionCtrl.topic = '';
	makePredictionCtrl.addTopic 				= addTopic;
	makePredictionCtrl.addTopicFromFormInput 				= addTopicFromFormInput;
	makePredictionCtrl.removeTopic 			= removeTopic;
	makePredictionCtrl.makePrediction 	= makePrediction;
	makePredictionCtrl.minimumTopicCharacters = 2;
	makePredictionCtrl.minimumPredictionTitleCharacters = 10;


	if ($stateParams.topic) {
		makePredictionCtrl.topic = $stateParams.topic;
	}

	focusElementById('make-prediction__title-input');


	function addTopicFromFormInput() {
		addTopic(makePredictionCtrl.topic);
		makePredictionCtrl.topic = '';
		focusElementById('make-prediction__topic-title-input');
	}
	function addTopic(topicTitle) {
		makePredictionCtrl.formErrorMessages = validatePredictionWithNewTitle(newPrediction.predictionTitle, newPrediction.topicTitles, topicTitle);
		if ( ! makePredictionCtrl.formErrorMessages.topicTitleErrors.length && ! makePredictionCtrl.formErrorMessages.topicCountErrors.length && newPrediction.topicTitles.indexOf(makePredictionCtrl.topicTitle) === -1 ) {
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
		var newPredictionCopy = angular.copy(newPrediction);
		makePredictionCtrl.formErrorMessages = PredictionService.validatePredictionData(newPredictionCopy.title, newPredictionCopy.topicTitles);

		var errorCount = 0;
		angular.forEach(makePredictionCtrl.formErrorMessages, function(errorMessageType) {
			errorCount += errorMessageType.length;
		});
		if (errorCount === 0) {
			newPrediction.topicTitles = [];
			newPrediction.title = '';
			PredictionService
				.createNewPrediction(newPredictionCopy.title, newPredictionCopy.topicTitles)
				.then(function(prediction){
					makePredictionCtrl.newlyAddedPredictions.push(prediction);
				});
		}
	}

}








})();


