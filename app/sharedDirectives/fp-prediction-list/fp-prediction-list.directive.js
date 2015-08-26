(function() {
'use strict';

angular.module('myApp')
    .controller('FpPredictionList', FpPredictionList)
    .directive('fpPredictionList', function() {
        return {
            templateUrl: 'sharedDirectives/fp-prediction-list/fp-prediction-list.template.html',
            bindToController:true,
            controller:'FpPredictionList as ctrl',
            scope: {
                'currentPageNumber': '@',
                'title':'@',
                'topicTitle': '@',
                'isAddNewPredictionHidden': '@',
                'isAddNewPredictionLabelHidden':'@',
                'isAddNewPredictionAutofocused': '@',
                'isPredictionLoadingEnabled': '@',
                'getPredictions': '&'
            }
        };
    });

FpPredictionList.$inject = ['$scope', '$state', '$window', 'PredictionService', 'JudgementService'];
function FpPredictionList($scope,  $state,  $window,  PredictionService, JudgementService) {

    var NUM_PREDICTIONS_PER_PAGE = 30;

    $window.scroll(0, 0);

    var _this = this;
    _this.NUM_PREDICTIONS_PER_PAGE = NUM_PREDICTIONS_PER_PAGE;
    _this.currentPageNumber = Number(_this.currentPageNumber) || 1;
    _this.goToPageNumber = goToPageNumber;
    _this.onSaveNewPredictionRequest = onSaveNewPredictionRequest;
    _this.onSaveNewPredictionSuccess = onSaveNewPredictionSuccess;
    _this.onDeletePredictionSuccess = onDeletePredictionSuccess;
    _this.newlySavedPredictions =
        PredictionService.getNewlySavedPredictions(_this.topicTitle);


    (function loadPredictions() {
        if (_this.isPredictionLoadingEnabled) {
            _this.isLoadingPredictions = true;
            _this.getPredictions({
                numPredictions: NUM_PREDICTIONS_PER_PAGE,
                numPredictionsToSkip: NUM_PREDICTIONS_PER_PAGE * (_this.currentPageNumber - 1)
            })
            .then(function(predictions) {
                _this.predictions = predictions;
                _this.isLoadingPredictions = false;
                if (predictions.length === NUM_PREDICTIONS_PER_PAGE) {
                    _this.nextPageNumber = Number(_this.currentPageNumber) + 1;
                    _this.previousPages = getPageNumbers(_this.nextPageNumber);
                } else {
                    _this.previousPages = getPageNumbers(Number(_this.currentPageNumber));
                }

                _this.isPaginationActive =
                    _this.currentPageNumber && _this.currentPageNumber > 1 ||
                    !!predictions.length &&
                    predictions.length >= NUM_PREDICTIONS_PER_PAGE;
            });
        }
    })();

    function getPageNumbers(numPages) {
        var pages = [{
            'title': 1,
            'urlId': ''
        }];
        for (var i = 2; i < numPages + 1; i++) {
            pages.push({
                'title': i,
                'urlId': i
            });
        }
        return pages;
    }

    function goToPageNumber(pageNumber) {
        $state.go(
            $state.$current.name,
            {page: pageNumber}
        );
    }

    function onSaveNewPredictionRequest() {
        _this.isSavingNewPrediction = true;
    }

    function onSaveNewPredictionSuccess(newlySavedPrediction) {
        _this.newlySavedPredictions.unshift(newlySavedPrediction);
        _this.isSavingNewPrediction = false;
    }

    function onDeletePredictionRequest(predictionId) {

    }

    function onDeletePredictionSuccess(predictionId) {
        /*console.log('inside onDelete...()', predictionId);
        var i;
        var indexToRemove;
        for (i = 0; i < _this.newlySavedPredictions.length; i++) {
            if (_this.newlySavedPredictions[i].id === predictionId) {
                indexToRemove = _this.newlySavedPredictions.indexOf(_this.newlySavedPredictions[i]);
                _this.newlySavedPredictions.splice(indexToRemove, 1);
            }
        }
        for (i = 0; i < _this.predictions.length; i++) {
            if (_this.predictions[i].id === predictionId) {
                indexToRemove = _this.predictions.indexOf(_this.predictions[i]);
                _this.predictions.splice(indexToRemove, 1);
            }
        }*/
    }
}

})();
