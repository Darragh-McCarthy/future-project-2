(function() {
'use strict';

angular.module('myApp')
    .controller('Notifications', Notifications);

Notifications.$inject = ['NotificationService'];
function Notifications(NotificationService) {

    var _this = this;
    NotificationService.getUnreadNotifications()
    .then(function(notifications) {
        console.log(notifications);
        _this.reasonCommentNotifications = notifications.filter(function(notification) {
            return 'newCommentAddedToReason' === notification.notificationType;
        });
        _this.predictionJudgementNotifications = notifications.filter(function(notification) {
            return 'newJudgementAddedToPrediction' === notification.notificationType;
        });
    });
}

})();
