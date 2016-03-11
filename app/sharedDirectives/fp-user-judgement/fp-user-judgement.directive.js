(function() {
'use strict';

angular.module('myApp')
    .controller('FpUserJudgement', FpUserJudgement)
    .directive('fpUserJudgement', function() {
        return {
            templateUrl:'sharedDirectives/fp-user-judgement/fp-user-judgement.template.html',
            bindToController:true,
            controller:'FpUserJudgement as ctrl',
            scope: {
                predictionId: '@',
                onAddReason: '&',
                onSetLikelihoodPercent: '&',
                onDeleteLikelihoodPercent: '&',
                onAlreadyHasReason: '&',
                predictionHtmlId: '@'
            }
        };
    });

FpUserJudgement.$inject = ['focusElementById', 'JudgementService', '$timeout', 'UserAuth', '$state'];
function FpUserJudgement(focusElementById, JudgementService, $timeout, UserAuth, $state) {


    console.warn('if updateReason() fails, need to display a save button and error message');

    var RECOMMENDED_MIN_REASON_CHARACTER_LENGTH = 15;
    var REASON_SAVED_NOTIFICATION_VISIBILITY_MILLISECONDS = 3000;

    var _this = this;
    _this.isReasonVisible = true;
    _this.addReasonTextInputId = 'prediction-' + _this.predictionId + '__add-reason-text-input';
    _this.percentOptions = JudgementService.getLikelihoodPercentOptions();
    _this.toggleLikelihoodPercent = toggleLikelihoodPercent;
    _this.updateReason = updateReason;
    _this.showAddReasonLabel = showAddReasonLabel;

    JudgementService.getUserJudgementForPrediction(_this.predictionId)
    .then(function(judgement) {
        if (judgement) {
            _this.currentJudgement = judgement;
            _this.reasonInputText = judgement.reasonText || '';
            updateAddReasonLabelVisibility();
            updateIsFocusOnHoverEnabled();

            if (judgement.reasonText) {
                _this.onAlreadyHasReason();
                _this.isReasonVisible = false;
            }
        }
    });

    updateAddReasonLabelVisibility();

    function toggleLikelihoodPercent(percent) {
        _this.isReasonVisible = true;

        /*return UserAuth.loginWithFacebook().then(
            function onSuccess(isNewLogin) {

                if (!_this.currentJudgement) {
                    _this.currentJudgement = {};
                }

                percent = parseInt(percent, 10);

                var copyOfCurrentJudgement = angular.copy(_this.currentJudgement);

                if (_this.currentJudgement && _this.currentJudgement.likelihoodPercent === percent) {
                    JudgementService.deleteLikelihoodPercent(_this.predictionId, percent).then(
                        function onSuccess() {
                            if (isNewLogin) {
                                $state.go($state.current, {}, {
                                    'reload':true
                                });
                                return;
                            }
                            _this.onDeleteLikelihoodPercent({
                                judgement:copyOfCurrentJudgement
                            });
                        },
                        function onError() {

                        }
                    );
                    console.log('setting likelihoodPercent to null');
                    _this.currentJudgement.likelihoodPercent = null;

                } else {
                    JudgementService.setLikelihoodPercent(_this.predictionId, percent)
                    .then(
                        function onSuccess(savedJudgement) {
                            _this.currentJudgement.likelihoodPercent = savedJudgement.likelihoodPercent;
                            _this.currentJudgement.id = savedJudgement.id;

                            if (typeof _this.currentJudgement.reasonText === 'undefined' && savedJudgement.reasonText) {
                                _this.currentJudgement.reasonText = savedJudgement.reasonText;
                                _this.reasonInputText = savedJudgement.reasonText;
                            }
                            console.log(savedJudgement);
                            _this.onSetLikelihoodPercent({
                                'judgement':savedJudgement
                            });

                            if (isNewLogin) {
                                $state.go($state.current, {}, {
                                    'reload':true
                                });
                            }
                        },
                        function onError() {

                        }
                    );

                    _this.currentJudgement.likelihoodPercent = percent;
                    focusElementById(_this.addReasonTextInputId);
                }
            },
            function onError() {

            }
        );*/
    }

    function updateReason() {

        if (typeof _this.currentJudgement.reasonText === 'undefined' && _this.reasonInputText === '') {
            return;
        }

        if (_this.reasonInputText !== _this.currentJudgement.reasonText) {
            _this.isSavingReason = true;
            updateAddReasonLabelVisibility();
            _this.currentJudgement.reasonText = _this.reasonInputText;
            updateIsFocusOnHoverEnabled();
            JudgementService.setReason(_this.currentJudgement.id, _this.reasonInputText).then(
                function onSuccess(savedJudgement) {
                    _this.onAddReason({
                        'judgement':savedJudgement
                    });
                    _this.currentJudgement.reasonText = savedJudgement.reasonText;
                    _this.isSavingReason = false;
                    _this.isReasonSavedNoticeActive = true;
                    $timeout(function() {
                        _this.isReasonSavedNoticeActive = false;
                    }, REASON_SAVED_NOTIFICATION_VISIBILITY_MILLISECONDS);
                },
                function onError() {
                    _this.isSavingReason = false;
                }
            );
        }
    }

    function showAddReasonLabel() {
        _this.hideLabel = false;
    }

    function updateIsFocusOnHoverEnabled() {
        _this.isFocusOnHoverEnabled = !!!(_this.currentJudgement.reasonText &&
            (_this.currentJudgement.reasonText.length > RECOMMENDED_MIN_REASON_CHARACTER_LENGTH));
    }

    function updateAddReasonLabelVisibility() {
        _this.hideLabel = !!_this.reasonInputText || !!(_this.currentJudgement && _this.currentJudgement.reasonText);
    }
}

})();
