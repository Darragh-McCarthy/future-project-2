(function(){
'use strict';


angular.module('myApp')
	.controller('MakePrediction', MakePrediction);


MakePrediction.$inject=['PredictionService','TopicService','$stateParams','focusElementById'];
function MakePrediction( PredictionService,  TopicService,  $stateParams,  focusElementById ) {

	var makePredictionCtrl = this;
	makePredictionCtrl.newlyAddedPredictions = [];
	makePredictionCtrl.formErrorMessages = {};
	var newPrediction = {
		title: '',
		topicTitles: []
	};
	makePredictionCtrl.newPrediction = newPrediction;
	makePredictionCtrl.topic = '';
	updateAddTopicButtonText(0);


	makePredictionCtrl.addTopic 				= addTopic;
	makePredictionCtrl.removeTopic 			= removeTopic;
	makePredictionCtrl.makePrediction 	= makePrediction;

	if ($stateParams.topic) {
		addUniqueTopicTitle($stateParams.topic);
	}



	function addTopic() {
		addUniqueTopicTitle(makePredictionCtrl.topic);
		updateAddTopicButtonText(newPrediction.topicTitles.length);
		makePredictionCtrl.topic = '';
		focusElementById('topicTextInput');
	}
	function addUniqueTopicTitle(topicTitle) {
		makePredictionCtrl.formErrorMessages = validatePredictionWithNewTitle(newPrediction.predictionTitle, newPrediction.topicTitles, topicTitle);
		if ( ! makePredictionCtrl.formErrorMessages.topicTitleErrors.length && ! makePredictionCtrl.formErrorMessages.topicCountErrors.length && newPrediction.topicTitles.indexOf(topicTitle) === -1 ) {
			newPrediction.topicTitles.push(topicTitle);
		}
	}
	function validatePredictionWithNewTitle(predictionTitle, topicTitles, newTopicTitle) {
		var topicTitlesCopy = newPrediction.topicTitles.slice();
		topicTitlesCopy.push(newTopicTitle);
		return PredictionService.validatePredictionData(newPrediction.title,topicTitlesCopy);
	}
	function removeTopic(topicTitle) {
		var index = newPrediction.topicTitles.indexOf(topicTitle);
		newPrediction.topicTitles.splice(index, 1);
		updateAddTopicButtonText(newPrediction.topicTitles.length);
	}
	function makePrediction() {
		console.log('inside makePrediction');
		var newPredictionCopy = angular.copy(newPrediction);
		makePredictionCtrl.formErrorMessages = PredictionService.validatePredictionData(newPredictionCopy.title, newPredictionCopy.topicTitles);

		var errorCount = 0;
		angular.forEach(makePredictionCtrl.formErrorMessages, function(errorMessageType) {
			errorCount += errorMessageType.length;
		});
		if (errorCount === 0) {
			newPrediction.topicTitles = [];
			newPrediction.title = '';
			/*PredictionService
				.addNewPrediction(newPredictionCopy.title, newPredictionCopy.topicTitles)
				.then(function(){
					newPredictions.push(newPredictionCopy);
				});*/

			console.log('getting predictions by topic id');
			PredictionService.getPredictionsByTopicTitle('Film')
				.then(function(predictions){
					console.log(predictions);
					makePredictionCtrl.newlyAddedPredictions = predictions;
				});
		}
		else {
			console.log(makePredictionCtrl.formErrorMessages);
		}

	}


	
	function updateAddTopicButtonText(topicsCount) {
		makePredictionCtrl.addTopicButtonText = topicsCount ? 'Add another topic' : 'Add topic';
	}

}








})();


