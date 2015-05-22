(function(){
'use strict';


angular.module('myApp')
.directive('fpPrediction', function() {
	return {
		templateUrl: 'sharedDirectives/predictions/fp-prediction.template.html',
		scope: {
			prediction: '=',
      topicToHide: '=',
      onexpand: '&onexpand',
      showTopicEditingByDefault: '@',
      showLikelihoodEstimateByDefault: '@'
		},
		bindToController: true,
		controller: 'Prediction as predictionCtrl',
		//link: function(scope, element, attrs) {
		//	console.log(typeof attrs.prediction)
		//}
	}
});


angular.module('myApp')
	.controller('Prediction', Prediction);

Prediction.$inject=['$q','$state','PredictionService'];
function Prediction( $q,  $state,  PredictionService ) {

  var MAX_GRAPHBAR_HEIGHT = 100;
  var MIN_GRAPHBAR_HEIGHT = 5;
  var MAX_TOPICS_PER_PREDICTION = 8;

  var mainTopics = [
    'Entertainment',
    'Science',
    'Technology',
    'Health',
    'Business',
    'Other popular topics go here'
  ];

	var _this = this;

  //Needs to be removed
  _this.maxTopicsPerPrediction = MAX_TOPICS_PER_PREDICTION;
  _this.addTopicFromSuggestedTopics = addTopicFromSuggestedTopics;
  _this.toggleLikelihoodEstimate = toggleLikelihoodEstimate;
  _this.prediction.createdAt = formatPredictionCreatedAt(_this.prediction.createdAt);
  _this.makeLikelihoodEstimateOptionsVisible = makeLikelihoodEstimateOptionsVisible;
  _this.isEditingTopics = false;
  _this.newTopicTitle = '';
  _this.addTopicFromInputToPrediction = addTopicFromInputToPrediction;
  _this.topicIsSavingMessage = '';
  _this.removeTopicFromPrediction = removeTopicFromPrediction;
  _this.toggleEditing = toggleEditing;
  _this.navigateToTopic = navigateToTopic;
  updateSuggestedTopics();

  if (_this.showTopicEditingByDefault) {
    _this.isEditingTopics = true;
    _this.isLikelihoodSelectionVisible = _this.showLikelihoodEstimateByDefault;    
  }
  else {
    _this.isLikelihoodSelectionVisible = true;
  }

  allocateGraphBarHeights(_this.prediction.communityEstimates);



  (function dontListTopicWhenOnThatTopicPage() {
    if (_this.topicToHide) {
      for (var i = 0; i < _this.prediction.topics.length; i++) {
        if (_this.prediction.topics[i].title === _this.topicToHide) {
          var index = _this.prediction.topics.indexOf(_this.prediction.topics[i]);
          _this.prediction.topics.splice(index, 1);
        }
      }
    }
  })();

  function toggleLikelihoodEstimate(percent){
    var promises = [];

    /*var firstCount = [];
    angular.forEach(_this.prediction.communityEstimates, function (estimate){
      firstCount.push(estimate.count);
    });
    console.log(firstCount);*/
    var estimateToRemove = _this.prediction.userEstimate;
    if (estimateToRemove) {
      promises.push(removeLikelihoodEstimate());
      _this.prediction.communityEstimatesCount--;
    }
    if ( ! estimateToRemove || estimateToRemove.likelihoodEstimatePercent !== percent) {
     promises.push(addLikelihoodEstimate(percent));
      _this.prediction.communityEstimatesCount++;
    }
    /*
    var secondCount = [];
    angular.forEach(_this.prediction.communityEstimates, function (estimate){
      secondCount.push(estimate.count);
    });
    console.log(secondCount);
    */
    $q.all(promises).then(function(){
      allocateGraphBarHeights(_this.prediction.communityEstimates);
    });
  }
  function addLikelihoodEstimate(percent) {
    return $q(function(resolve, reject) {
      percent = parseInt(percent, 10);
      if ( ! _this.prediction.isExpanded) {
        _this.onexpand();
        _this.prediction.isExpanded = true;
      }
      PredictionService.addLikelihoodEstimate(_this.prediction.id, percent).then(function(newLikelihoodEstimate){
        _this.prediction.userEstimate = newLikelihoodEstimate;
        for (var i = 0; i < _this.prediction.communityEstimates.length; i++) {
          if (_this.prediction.communityEstimates[i].percent == percent) {
            _this.prediction.communityEstimates[i].count++;
          }
        }
        resolve();
      });
    });
  }
  function removeLikelihoodEstimate() {
    return $q(function(resolve, reject){ 
      for (var i = 0; i < _this.prediction.communityEstimates.length; i++) {
        if (_this.prediction.communityEstimates[i].percent == _this.prediction.userEstimate.likelihoodEstimatePercent) {
          _this.prediction.communityEstimates[i].count--;
        }
      }
      PredictionService.removeLikelihoodEstimate(_this.prediction.id, _this.prediction.userEstimate.id, _this.prediction.userEstimate.likelihoodEstimatePercent).then(function(){
        resolve();
      });
      _this.prediction.userEstimate = null;
    });
  }
  function allocateGraphBarHeights(communityEstimates) {
    var largestCount = 0;
    angular.forEach(communityEstimates, function(estimate) {
      largestCount = Math.max(largestCount, estimate.count);
    });
    angular.forEach(communityEstimates, function(estimate) {
      var graphBarHeight = MIN_GRAPHBAR_HEIGHT;
      if (estimate.count > 0 ) {
        graphBarHeight = MAX_GRAPHBAR_HEIGHT / largestCount * estimate.count;
      }
      estimate.graphBarHeight = {'height':graphBarHeight + 'px'};
    });
  }
  function formatPredictionCreatedAt(dateToFormat) {
    var currentYear =  new Date().getFullYear();
    var formattedDate = '';
    if (dateToFormat.getFullYear() !== currentYear) {
      formattedDate += dateToFormat.getFullYear();
    }
    formattedDate += ' ' + ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"][dateToFormat.getMonth()];
    formattedDate += ' ' + dateToFormat.getDate();
    return formattedDate;
  }
  function addTopicFromInputToPrediction() {
    addTopicToPrediction(_this.newTopicTitle);
    _this.newTopicTitle = '';
  }
  function addTopicFromSuggestedTopics(suggestedTopicTitlesIndex) {
    var topicTitle = _this.suggestedTopicTitles[suggestedTopicTitlesIndex];
    _this.suggestedTopicTitles.splice(suggestedTopicTitlesIndex, 1);
    addTopicToPrediction(topicTitle);
  }
  function addTopicToPrediction(newTopicTitle) {
    console.log(newTopicTitle);
    PredictionService.addTopicByTitleToPrediction(_this.prediction.id, newTopicTitle).then(function(topic){
      if (topic) {
        _this.prediction.topics.push(topic);
        updateSuggestedTopics();
      }
      _this.topicIsSavingMessage = '';
    });
    _this.topicIsSavingMessage = newTopicTitle;
  }
  function removeTopicFromPrediction(topicId){
    PredictionService.removeTopicFromPrediction(_this.prediction.id, topicId).then(function(){
      var topicToRemove = null;
      for (var i = 0; i < _this.prediction.topics.length; i++) {
        if (_this.prediction.topics[i].id === topicId) {
          topicToRemove = _this.prediction.topics[i];
        }
      }
      var index = _this.prediction.topics.indexOf(topicToRemove);
      if (index > -1) {
        _this.prediction.topics.splice(index, 1);
      }
      updateSuggestedTopics();
    });
  }
  function navigateToTopic(topicTitle) {
    if ( ! _this.isEditingTopics) {
      $state.go('app.search', {
        q: topicTitle
      });
    }
  }
  function toggleEditing() {
    _this.isEditingTopics =              ! _this.isEditingTopics;
    _this.isLikelihoodSelectionVisible = ! _this.isEditingTopics;
  }
  function makeLikelihoodEstimateOptionsVisible() {
    console.log('isLikelihoodSelectionVisible setting to true');
    _this.isLikelihoodSelectionVisible = true;
  }
  function updateSuggestedTopics() {
    _this.suggestedTopicTitles = angular.copy(mainTopics);
    angular.forEach(_this.prediction.topics, function(eachPredictionTopic){
      var index = _this.suggestedTopicTitles.indexOf(eachPredictionTopic.title);
      if (index > -1) {
        _this.suggestedTopicTitles.splice(index, 1);
      }
    });
  }


}

})();

