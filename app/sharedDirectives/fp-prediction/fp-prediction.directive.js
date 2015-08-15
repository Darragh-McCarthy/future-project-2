(function() {
'use strict';

angular.module('myApp')
    .controller('FpPrediction', FpPrediction)
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
        controller: 'FpPrediction as ctrl'
    };
});

FpPrediction.$inject = ['$timeout', '$scope', '$q', '$state', 'PredictionService', 'UserAuth', 'focusElementById', 'TopicService'];
function FpPrediction($timeout,  $scope,  $q,  $state,  PredictionService,  UserAuth,  focusElementById,  TopicService ) {

    var MAX_TOPICS_PER_PREDICTION = 8;

    var _this = this;
    _this.onAddReason = onAddReason;
    _this.maxTopicsPerPrediction = MAX_TOPICS_PER_PREDICTION;
    _this.addTopicFromSuggestedTopics = addTopicFromSuggestedTopics;
    _this.isEditingTopics = false;
    _this.newTopicTitle = '';
    _this.addTopicFromInputToPrediction = addTopicFromInputToPrediction;
    _this.topicIsSavingMessage = '';
    _this.removeTopicFromPrediction = removeTopicFromPrediction;
    _this.toggleEditing = toggleEditing;
    _this.deletePrediction = deletePrediction;
    _this.toggleShowDeletionConfirmation = toggleShowDeletionConfirmation;
    _this.flashPredictionTitle = flashPredictionTitle;
    _this.setTopicsToVisible = setTopicsToVisible;

    TopicService.getNewPredictionTopicTitleSuggestions().then(
        function onSuccess(topicTitles) {
            _this.suggestedTopicTitles = topicTitles;
        }
    );

    if (_this.prediction.authorId === UserAuth.userId) {
        _this.currentUserIsAuthor = true;
    }

    if (_this.showTopicEditingByDefault && _this.prediction.topics.length < 2) {
        _this.isEditingTopics = true;
        _this.isLikelihoodSelectionVisible = _this.showLikelihoodEstimateByDefault;
    } else {
        _this.isLikelihoodSelectionVisible = true;
    }

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

    /*
    function formatPredictionCreatedAt(dateToFormat) {
        var currentYear =  new Date().getFullYear();
        var formattedDate = '';
        if (dateToFormat.getFullYear() !== currentYear) {
            formattedDate += dateToFormat.getFullYear();
        }
        formattedDate += ' ' + [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'June',
            'July',
            'Aug',
            'Sept',
            'Oct',
            'Nov',
            'Dec'
        ][dateToFormat.getMonth()];

        formattedDate += ' ' + dateToFormat.getDate();
        return formattedDate;
    }
    */
    function addTopicFromInputToPrediction() {
        addTopicToPrediction(_this.newTopicTitle);
        _this.newTopicTitle = '';
    }

    function addTopicFromSuggestedTopics(index) {
        var topicTitle = _this.suggestedTopicTitles[index];
        _this.suggestedTopicTitles.splice(index, 1);
        addTopicToPrediction(topicTitle);
    }

    function addTopicToPrediction(newTopicTitle) {
        PredictionService.addTopicByTitleToPrediction(_this.prediction.id, newTopicTitle)
        .then(function(newTopic) {
            _this.prediction.topics.push(newTopic);
            _this.topicIsSavingMessage = '';
        });
        _this.topicIsSavingMessage = newTopicTitle;
    }

    function removeTopicFromPrediction(topicId) {
        PredictionService.removeTopicFromPrediction(_this.prediction.id, topicId).then(function() {
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
        });
    }

    function toggleEditing() {
        _this.isEditingTopics =              !_this.isEditingTopics;
        _this.isLikelihoodSelectionVisible = !_this.isEditingTopics;
    }

    function toggleShowDeletionConfirmation() {
        _this.showDeletionConfirmation = !_this.showDeletionConfirmation;
    }

    function deletePrediction() {
        _this.isDeletingPrediction = true;

        PredictionService
        .deletePredictionById(_this.prediction.id)
        .then(function() {
            _this.isDeletingPrediction = false;
            _this.onDeletePredictionSuccess({predictionId:_this.prediction.id});
        });
    }

    function setTopicsToVisible() {
        _this.areTopicsVisible = true;
    }

    function onAddReason() {
        flashPredictionTitle();
        _this.areTopicsVisible = true;
    }

    function flashPredictionTitle() {
        _this.isFlashPredictionTitleActive = true;
        $timeout(function() {
            _this.isFlashPredictionTitleActive = false;
        }, 1000);
    }

}

})();

