(function() {
'use strict';

angular.module('myApp')
    .controller('UserProfile', UserProfile);

UserProfile.$inject = ['$state', '$stateParams', 'UserAuth', 'PredictionService'];
function UserProfile($state,  $stateParams,  UserAuth,  PredictionService ) {
    scroll(0, 0);

    var _this = this;
    _this.selectedTab = 'notifications';
    _this.userPhotoUrl = '';
    _this.userId = $stateParams.userId;
    _this.logout = logout;
    _this.UserAuth = UserAuth;
    _this.userToDisplay = undefined;
    _this.userProfileUserId = $stateParams.userId;
    _this.loggedInUserId = UserAuth.getUserId();
    _this.getPredictions = getPredictions;

    //var pageIndex = $stateParams.page || 0;

    UserAuth.getUserById($stateParams.userId).then(function(user) {
        _this.userToDisplay = user;
    });

    function getPredictions(numPredictions, numPredictionsToSkip) {
        console.log(numPredictions, numPredictionsToSkip);
        return PredictionService.getPredictionsByAuthorId($stateParams.userId);
    }

    function logout() {
        UserAuth.logout();
        $state.go($state.current, {}, {
            reload: true
        });
    }
}

})();
