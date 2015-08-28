(function() {
'use strict';

angular.module('myApp')
    .controller('Feedback', Feedback);

Feedback.$inject = ['Parse', '$timeout', 'focusElementById'];
function Feedback(Parse, $timeout, focusElementById) {

    scroll(0, 0);

    var _this = this;
    _this.feedback = {};
    _this.feedbackSubmitSuccessCount = 0;
    _this.submitFeedback = submitFeedback;

    _this.feedbackTextboxId = 'feedbackTextboxId';
    focusElementById(_this.feedbackTextboxId);

    function submitFeedback() {
        if (_this.feedback.feedbackText) {
            Parse.Cloud.run('saveUserFeedback', {
                feedbackText: _this.feedback.feedbackText,
                email: _this.feedback.email
            }).then(
                function onSuccess() {
                    _this.feedbackSubmitSuccessCount++;
                    _this.isFeedbackSubmittedNoticeVisible = true;
                    $timeout(function() {
                        _this.isFeedbackSubmittedNoticeVisible = false;
                    }, 5000);
                    _this.feedback.feedbackText = '';
                    focusElementById(_this.feedbackTextboxId);

                },
                function onError(e) {
                    _this.isFeedbackErrorNoticeVisible = true;
                    $timeout(function() {
                        _this.isFeedbackErrorNoticeVisible = false;
                    }, 5000);
                    console.error(e);
                }
            );
        }
    }
}

})();
