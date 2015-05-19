(function(){
'use strict';


angular.module('myApp')
.directive('fpPrediction', function() {
	return {
		templateUrl: 'sharedDirectives/prediction.template.html',
		scope: {
			prediction: '=',
      topicToHide: '=',
      onexpand: '&onexpand'
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

Prediction.$inject=['PredictionService'];
function Prediction( PredictionService ) {
	var _this = this;
  _this.toggleLikelihoodEstimate   = toggleLikelihoodEstimate;
  _this.prediction.createdAt       = formatPredictionCreatedAt(_this.prediction.createdAt);
  _this.isLikelihoodSelectionVisible = false;

  _this.isEditingTopics = true;
  _this.newTopicTitle = '';
  _this.addNewTopic = addNewTopic;

  allocateGraphBarHeights(_this.prediction.communityEstimates);



  (function removeTopicFromPredictions() {
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
    if (_this.prediction.userEstimate === percent) {
      removeLikelihoodEstimate(percent);
    } else {
      addLikelihoodEstimate(percent);
    }
  }
  function addLikelihoodEstimate(percent) {
    _this.onexpand();
    _this.prediction.isExpanded = true;

    PredictionService.addLikelihoodEstimate(_this.prediction.id, percent).then(function(updatedPrediction){
      _this.prediction.userEstimate = percent;
      _this.prediction.communityEstimates = updatedPrediction.communityEstimates;
      _this.prediction.communityEstimatesCount = updatedPrediction.communityEstimatesCount;
      allocateGraphBarHeights(_this.prediction.communityEstimates);
    });
  }
  function removeLikelihoodEstimate(percent) {
    _this.prediction.userEstimate = null;
  }
  function allocateGraphBarHeights(communityEstimates) {
    var maximumHeight = 100;
    var minimumHeight = 5;
    var largestCount = 0;
    angular.forEach(communityEstimates, function(estimate) {
      largestCount = Math.max(largestCount, estimate.count);
    });
    angular.forEach(communityEstimates, function(estimate) {
      var graphBarHeight = minimumHeight;
      if (estimate.count > 0 ) {
        graphBarHeight = maximumHeight / largestCount * estimate.count;
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
  function addNewTopic() {
    PredictionService.addTopicByTitleToPrediction(_this.prediction.id,_this.newTopicTitle).then(function(response){
      /*if (response.errors) {
        _this.topicValidationErrors = topic.errors;
      } else {
        _this.prediction.topics.push();
      }*/
    });
    _this.newTopicTitle = '';

    /*
    _this.formErrorMessages = validatePredictionWithNewTitle(newPrediction.predictionTitle, newPrediction.topicTitles, topicTitle);
    if ( ! _this.formErrorMessages.topicTitleErrors.length && ! _this.formErrorMessages.topicCountErrors.length && newPrediction.topicTitles.indexOf(_this.topicTitle) === -1 ) {
      newPrediction.topicTitles.push(topicTitle);
    }*/
  }


}

})();

