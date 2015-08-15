(function() {
'use strict';

angular.module('myApp')
    .controller('Header', Header);

Header.$inject = ['UserAuth', '$timeout', '$state'];
function Header(UserAuth,  $timeout, $state) {
    var _this = this;
    _this.logout = logout;
    _this.loginWithFacebook = loginWithFacebook;

    if (UserAuth.isLoggedIn()) {
        _this.userId = UserAuth.getUserId();
        UserAuth.promiseUserThumbnailUrl().then(function(url) {
            _this.userThumbnailUrl = url;
        });
    }

    _this.isLoginOptionActive = !UserAuth.isLoggedIn();
    _this.isLogoutOptionActive = UserAuth.isLoggedIn();
    _this.isUserProfileOptionActive = UserAuth.isLoggedIn();

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
