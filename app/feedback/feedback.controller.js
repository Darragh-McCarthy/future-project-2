(function() {
'use strict';

angular.module('myApp')
    .controller('Feedback', Feedback);

Feedback.$inject = ['Parse', '$timeout'];
function Feedback(Parse, $timeout) {

    var _this = this;
    _this.feedback = {};
    _this.feedbackSubmitSuccessCount = 0;
    _this.submitFeedback = submitFeedback;

    function submitFeedback() {

        Parse.Cloud.run('submitFeedback', {
            feedbackText: _this.feedback.feedbackText
        }).then(
            function onSuccess() {

                _this.feedbackSubmitSuccessCount++;
                _this.isFeedbackSubmittedNoticeVisible = true;
                $timeout(function() {
                    _this.isFeedbackSubmittedNoticeVisible = false;
                }, 2000);
                _this.feedback.feedbackText = '';
            },
            function onError(e) {

                _this.isFeedbackErrorNoticeVisible = true;
                $timeout(function() {
                    _this.isFeedbackErrorNoticeVisible = false;
                }, 2000);
            }
        );
    }
}

})();
