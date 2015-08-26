(function() {
'use strict';

angular.module('myApp')
    .factory('NotificationService', NotificationService);

NotificationService.$inject = ['Parse', 'UserAuth'];
function NotificationService(Parse, UserAuth) {
/*
    var promiseNotifications = UserAuth.promiseLoginSuccessful.then(function() {
        return Parse.Cloud.run('getUnreadNotifications')
        .then(function(notifications) {
            console.log('notifications', notifications);
            return notifications;
        }, function(e) { console.error(e); });
    });

    return {
        'getUnreadNotificationsCount': getUnreadNotificationsCount,
        'getUnreadNotifications': getUnreadNotifications
    };

    function getUnreadNotificationsCount() {
        return promiseNotifications.then(function(notifications) {
            if (notifications.length === 0) {
                return 13;
            }
            return notifications.length;
        });
    }

    function getUnreadNotifications() {
        return promiseNotifications;
    }
    */
    return {};
}

})();
