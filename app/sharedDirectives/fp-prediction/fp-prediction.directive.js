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
            showDateAdded: '@',
            showLikelihoodEstimateByDefault: '@',
		},
		bindToController: true,
		controller: 'FpPrediction as predictionCtrl'
	};
});


angular.module('myApp')
	.controller('FpPrediction', FpPrediction);

FpPrediction.$inject=['$q','$state','PredictionService','LikelihoodEstimateService','currentUser','focusElementById','TopicService'];
function FpPrediction( $q,  $state,  PredictionService,  LikelihoodEstimateService,  currentUser,  focusElementById,  TopicService ) {

    var MAX_GRAPHBAR_HEIGHT = 100;
    var MIN_GRAPHBAR_HEIGHT = 3;
    var MAX_TOPICS_PER_PREDICTION = 8;

    var mainTopics = TopicService.featuredTopicTitles.map(function(topic){
        return topic.title;
    });



	var _this = this;
  //overriding directive init property
  _this.showDateAdded = true;





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
  _this.deletePrediction = deletePrediction;
  _this.toggleShowDeletionConfirmation = toggleShowDeletionConfirmation;
  _this.addReason = addReason;

  function addReason() {
    _this.reason = _this.reasonInputText;
    _this.reasonInputText = '';
  }

  updateSuggestedTopics();

  if (_this.prediction.author.id === currentUser.userId) {
    _this.currentUserIsAuthor = true;
  }

  if (_this.showTopicEditingByDefault) {
    _this.isEditingTopics = true;
    _this.isLikelihoodSelectionVisible = _this.showLikelihoodEstimateByDefault;    
  } else {
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
        percent = parseInt(percent, 10);
        expandPrediction();
        _this.prediction.userEstimate = {
            'likelihoodEstimatePercent':percent 
        }

        /*
        var updatingEstimate = null;
        if (percent === _this.prediction.likelihoodEstimates.userEstimate.percent) {
            updatingEstimate = LikelihoodEstimateService.deleteEstimate(_this.prediction.id);
        } else {
            updatingEstimate = LikelihoodEstimateService.setUserEstimate(_this.prediction.id, percent)
        }
        _this.prediction.likelihoodEstimates = updatingEstimate.anticipatedUpdatedLikelihoodEstimates;
        allocateGraphBarHeights(_this.prediction.communityEstimates);

        updatingEstimate.promise.then(function(updatedLikelihoodEstimates){
            _this.prediction.likelihoodEstimates = updatedLikelihoodEstimates;
            allocateGraphBarHeights(_this.prediction.communityEstimates);
        });
        */
    }

    function expandPrediction() {
        if ( ! _this.prediction.isExpanded) {
            _this.onexpand();
            _this.prediction.isExpanded = true;
        }
        focusElementById('prediction-'+_this.prediction.id+'__add-reason-text-input');
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
  function toggleShowDeletionConfirmation() {
    _this.showDeletionConfirmation = ! _this.showDeletionConfirmation;
  }
  function deletePrediction() {
    _this.isDeletingPrediction = true;
    PredictionService.deletePredictionById(_this.prediction.id).then(function(){
      _this.isDeletingPrediction = false;
      _this.onDeletePredictionSuccess({predictionId:_this.prediction.id});
    });
  }

}

})();

