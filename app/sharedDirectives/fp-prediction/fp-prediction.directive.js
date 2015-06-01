(function(){
'use strict';


angular.module('myApp')
.directive('fpPrediction', function() {
	return {
		templateUrl: 'sharedDirectives/fp-prediction/fp-prediction.template.html',
		scope: {
			prediction: '=',
      topicToHide: '=',
      onexpand: '&onexpand',
      onDeletePredictionSuccess: '&',
      showTopicEditingByDefault: '@',
      showLikelihoodEstimateByDefault: '@',
		},
		bindToController: true,
		controller: 'FpPrediction as predictionCtrl'
	};
});


angular.module('myApp')
	.controller('FpPrediction', FpPrediction);

FpPrediction.$inject=['$q','$state','PredictionService','currentUser'];
function FpPrediction( $q,  $state,  PredictionService,  currentUser ) {

  var MAX_GRAPHBAR_HEIGHT = 100;
  var MIN_GRAPHBAR_HEIGHT = 3;
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
  _this.showConfirmDeletion = showConfirmDeletion;
  _this.hideConfirmDeletion = hideConfirmDeletion;
  _this.deletePrediction = deletePrediction;

  
  updateSuggestedTopics();

  if (_this.prediction.author.id === currentUser.userId) {
    _this.currentUserIsAuthor = true;
  }

  if (_this.showTopicEditingByDefault) {
    _this.isEditingTopics = true;
    _this.isLikelihoodSelectionVisible = _this.showLikelihoodEstimateByDefault;    
  }
  else {
    _this.isLikelihoodSelectionVisible = true;
  }

  allocateGraphBarHeights(_this.prediction.communityEstimates);


  (function placeTopicToHideFirstInTopicsList() {
    if (_this.topicToHide) {
      for (var i = 0; i < _this.prediction.topics.length; i++) {
        if (_this.prediction.topics[i].title === _this.topicToHide) {
          var index = _this.prediction.topics.indexOf(_this.prediction.topics[i]);
          var removedTopic = _this.prediction.topics.splice(index, 1)[0];
          _this.prediction.topics.unshift(removedTopic);
        }
      }
    }
  })();

  function toggleLikelihoodEstimate(percent){
    var promises = [];
    var estimateToRemove = _this.prediction.userEstimate;
    if (estimateToRemove) {
      promises.push(removeLikelihoodEstimate());
      _this.prediction.communityEstimatesCount--;
    }
    if ( ! estimateToRemove || estimateToRemove.likelihoodEstimatePercent !== percent) {
     promises.push(addLikelihoodEstimate(percent));
      _this.prediction.communityEstimatesCount++;
    }
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
    //console.log(communityEstimates);
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
      console.log(estimate.graphBarHeight);
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
    console.log(topicId);
    PredictionService.removeTopicFromPrediction(_this.prediction.id, topicId).then(function(){
      var topicToRemove = null;
      for (var i = 0; i < _this.prediction.topics.length; i++) {
        console.log(_this.prediction.topics[i].id);
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
      $state.go('app.topic', {
        topic: topicTitle
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
  function showConfirmDeletion() { _this.isConfirmDeletionVisible = true; }
  function hideConfirmDeletion() { _this.isConfirmDeletionVisible = false; }

  function deletePrediction() {
    _this.isDeletingPrediction = true;
    PredictionService.deletePredictionById(_this.prediction.id).then(function(){
      console.log('deleted prediction');
      _this.isDeletingPrediction = false;
      _this.onDeletePredictionSuccess({predictionId:_this.prediction.id});
    });
  }

}

})();

