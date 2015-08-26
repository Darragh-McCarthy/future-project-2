(function() {
'use strict';

angular.module('myApp')
    .controller('Header', Header);

Header.$inject = ['UserAuth', '$timeout', '$state', 'NotificationService'];
function Header(UserAuth,  $timeout, $state, NotificationService) {

    var _this = this;
    _this.logout = logout;
    _this.loginWithFacebook = loginWithFacebook;
    _this.isLoginOptionActive = !UserAuth.isLoggedIn();

    if (UserAuth.isLoggedIn()) {
        _this.userId = UserAuth.getUserId();
        _this.isNotificationsOptionActive = true;
        _this.isLogoutOptionActive = true;
        _this.isUserProfileOptionActive = true;

        UserAuth.promiseUserThumbnailUrl()
        .then(function(url) {
            _this.userThumbnailUrl = url;
        });

        /*NotificationService.getUnreadNotificationsCount()
        .then(function(notifications) {
            _this.numUnreadNotifications = notifications;
        });*/
    }

    function logout() {
        UserAuth.logout();
        $state.go($state.current, {}, {
            reload: true
        });
    }

    function loginWithFacebook() {
        UserAuth.loginWithFacebook().then(function() {
            $state.go($state.current, {}, {
                reload: true
            });
        });
    }
}

})();
