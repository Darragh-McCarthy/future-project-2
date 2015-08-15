(function() {
'use strict';

angular.module('myApp')
  .controller('Login', Login);

Login.$inject = ['UserAuth', '$window', '$state'];
function Login(UserAuth,  $window,  $state) {

    this.loginWithFacebook = function() {
        UserAuth.loginWithFacebook().then(function() {
            $state.go('app.recent');
        });
    };

}

})();
