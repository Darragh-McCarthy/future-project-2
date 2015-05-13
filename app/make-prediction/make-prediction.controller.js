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
	makePredictionCtrl.removeTopic 			= removeTopic;
	makePredictionCtrl.makePrediction 	= makePrediction;

	updateAddTopicButtonText(0);

	if ($stateParams.topic) {
		makePredictionCtrl.topic = $stateParams.topic;
		addTopic();
	}



	function addTopic() {
		makePredictionCtrl.formErrorMessages = validatePredictionWithNewTitle(newPrediction.predictionTitle, newPrediction.topicTitles, makePredictionCtrl.topic);
		if ( ! makePredictionCtrl.formErrorMessages.topicTitleErrors.length && ! makePredictionCtrl.formErrorMessages.topicCountErrors.length && newPrediction.topicTitles.indexOf(makePredictionCtrl.topicTitle) === -1 ) {
			newPrediction.topicTitles.push(makePredictionCtrl.topic);
		}
		updateAddTopicButtonText(newPrediction.topicTitles.length);
		makePredictionCtrl.topic = '';
		focusElementById('topicTextInput');
	}

	function validatePredictionWithNewTitle(predictionTitle, topicTitles, newTopicTitle) {
		var topicTitlesCopy = newPrediction.topicTitles.slice();
		topicTitlesCopy.push(newTopicTitle);
		return PredictionService.validatePredictionData(newPrediction.title,topicTitlesCopy);
	}
	function removeTopic(title) {
		var index = newPrediction.topicTitles.indexOf(title);
		newPrediction.topicTitles.splice(index, 1);
		updateAddTopicButtonText(newPrediction.topicTitles.length);
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
					makePredictionCtrl.newlyAddedPredictions.push(newPredictionCopy);
				});

			/*PredictionService.getPredictionsByTopicTitle('Film')
				.then(function(predictions){
					makePredictionCtrl.newlyAddedPredictions = predictions;
				});*/
		}
	}


	
	function updateAddTopicButtonText(topicsCount) {
		makePredictionCtrl.addTopicButtonText = topicsCount ? 'Add another topic' : 'Add topic';
	}

}








})();


