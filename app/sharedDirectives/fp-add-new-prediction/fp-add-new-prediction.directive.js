(function() {
'use strict';

var fpAddNewPredictionInstanceCount = 0;

angular.module('myApp')
    .directive('fpAddNewPrediction', function() {
    return {
        templateUrl:'sharedDirectives/fp-add-new-prediction/fp-add-new-prediction.template.html',
        scope: {
            topicTitle: '@',
            autofocus: '@',
            isLabelHidden: '@',
            onSaveNewPredictionSuccess: '&',
            onSaveNewPredictionRequest: '&'
        },
        bindToController: true,
        controller:'FpAddNewPrediction as ctrl'
    };
});

angular.module('myApp')
    .controller('FpAddNewPrediction', FpAddNewPrediction);

FpAddNewPrediction.$inject = ['$scope', '$state', 'PredictionService', 'focusElementById', 'UserAuth'];
function FpAddNewPrediction($scope,  $state,  PredictionService,  focusElementById, UserAuth) {

    var _this = this;

    fpAddNewPredictionInstanceCount++;
    if (_this.autofocus) {
        _this.predictionTextInputElementId =
            'fp-add-new-prediction__prediction-input-' +
            fpAddNewPredictionInstanceCount;
        focusElementById(_this.predictionTextInputElementId);
    }
    _this.newPredictionsCount = 0;
    _this.saveNewPrediction = saveNewPrediction;
    _this.removeDefaultTopic = removeDefaultTopic;
    _this.newPredictionTitle = '';
    _this.validateNewPrediction = validateNewPrediction;
    _this.displayedValidationErrors = [];
    _this.isMinLengthErrorHidden = true;

    function validateNewPrediction($event) {
        if (_this.newPredictionTitle === '') {
            _this.isMinLengthErrorHidden = true;
        }
        updateAddNewPredictionButtonText();
        var validation = PredictionService.validateNewPrediction(
            _this.newPredictionTitle
        );
        _this.isValidPrediction = !!!validation.errors.length;
        _this.displayedValidationErrors = validation.errors
            .filter(function(error) {
                if (_this.isMinLengthErrorHidden) {
                    return error.errorCode !== 'minlen';
                }
                return true;
            })
            .map(function(error) {
                return error.errorMsg;
            })
        ;
    }

    _this.placeholderText = '';
    if (_this.isLabelHidden !== '') {
        if (_this.topicTitle) {
            _this.placeholderText = 'What is your ' + _this.topicTitle + ' prediction?';
        } else {
            _this.placeholderText = 'What is your prediction?';
        }
    }

    function saveNewPrediction() {

        if (!_this.isValidPrediction) {
            _this.isMinLengthErrorHidden = false;
            return;
        }

        var predictionTitleToSave = _this.newPredictionTitle;
        _this.newPredictionTitle = '';
        _this.isValidPrediction = false;
        _this.isMinLengthErrorHidden = true;

        return UserAuth.loginWithFacebook().then(
            function onSuccess(isNewLogin) {
                updateAddNewPredictionButtonText();

                (function() {
                    if (_this.topicTitle) {
                        return PredictionService.saveNewPredictionWithTopicTitle(predictionTitleToSave, _this.topicTitle);
                    } else {
                        return PredictionService.saveNewPrediction(predictionTitleToSave);
                    }
                })().then(function(savedPrediction) {
                    _this.newPredictionsCount++;
                    _this.onSaveNewPredictionSuccess({
                        'newPrediction': savedPrediction
                    });
                    if (isNewLogin) {
                        $state.go($state.current, {}, {
                            'reload':true
                        });
                        console.log('isNewLogin, reloading');
                        return;
                    }
                });

                _this.onSaveNewPredictionRequest({TESTING:'TESTING'});
            },
            function onError() {
                _this.newPredictionTitle = predictionTitleToSave;
                _this.displayedValidationErrors = [
                    'Add your prediction by signing in with Facebook'
                ];
            }
        );
    }

    function removeDefaultTopic() {
        //_this.topicTitle = null;
        $state.go('app.recent');
    }

    function updateAddNewPredictionButtonText() {
        if (UserAuth.isLoggedIn()) {
            _this.addPredictionButtonText = 'Add prediction';
        } else {
            _this.addPredictionButtonText = 'Add prediction by connecting with Facebook';
        }
    }
}

})();

