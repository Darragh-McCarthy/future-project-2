(function() {
'use strict';

angular.module('myApp.sharedServices')
    .factory('UserAuth', UserAuth);

UserAuth.$inject = [
    '$q',
    '$window',
    '$timeout',
    'Parse'
];
function UserAuth($q, $window, $timeout, Parse) {

    var FACEBOOK_PROFILE_PHOTO_WIDTH = 200;
    var FACEBOOK_PROFILE_PHOTO_HEIGHT = 200;

    var promiseLoadFacebookSdk = loadAndInitializeFacebookSdk();
    var loginSuccessfulDeferred = $q.defer();

    if (isLoggedIn()) {
        verifyFacebookUserMatchesLoggedInUser().then(
            function onSuccess() {
                loginSuccessfulDeferred.resolve();
            }, function onError() {
                logout();
            }
        );
    }

    var currentUserObject = {
        'loginWithFacebook': loginWithFacebook,
        'logout': logout,
        'isLoggedIn': isLoggedIn,
        'promiseLoginSuccessful': loginSuccessfulDeferred.promise,
        'getUserId': getUserId,
        'getUserById': getUserById,
        'getCurrentUser': getCurrentUser,
        'promiseUserThumbnailUrl': promiseUserThumbnailUrl
    };
    return currentUserObject;

    function getUserId() {
        var loggedInUser = Parse.User.current();
        if (loggedInUser) {
            return loggedInUser.id;
        }
        return null;
    }

    function getCurrentUser() {
        var currentUser = Parse.User.current();
        if (currentUser) {
            return {
                'id': currentUser.id,
                'publicFacebookData': currentUser.get('publicFacebookData')
            };
        }
    }

    function getUserById(userId) {
        return Parse.Cloud.run('getUserById', {
            'userId': userId
        }).then(null, function(e) { console.error(e); });
    }

    function promiseUserThumbnailUrl() {
        return loginSuccessfulDeferred.promise.then(function() {
            return Parse.User.current().get('publicFacebookData').thumbnailUrl;
        });
    }

    function isLoggedIn() {
        return !!Parse.User.current();
    }

    function getFacebookIdFromParse() {
        return Parse.User.current().attributes.authData.facebook.id;
    }

    function loginWithFacebook() {

        if (isLoggedIn()) {
            return $q.when();
        }

        return logIntoParseWithFacebook().then(function(currentParseUser) {
            var promiseFacebookBasicData = $q(function(resolve, reject) {
                $window.FB.api('/me', function(response) {
                    if (response.error) {
                        reject();
                    }
                    resolve(response);
                });
            });

            var facebookId = getFacebookIdFromParse();
            var promiseThumbnailUrl = getFacebookProfilePhotoUrl(facebookId)
            .then(null, console.error.bind(console,
                    'error fetching fb profile photo url'));

            var promiseProfilePhotoUrl = getFacebookProfilePhotoUrl(facebookId,
                FACEBOOK_PROFILE_PHOTO_WIDTH,
                FACEBOOK_PROFILE_PHOTO_HEIGHT
            ).then(null, console.error.bind(console,
                'error fetching fb profile thumbnail url'));

            return promiseFacebookBasicData.then(function(basicFacebookData) {
                return promiseThumbnailUrl.then(function(thumbnailUrl) {
                    return promiseProfilePhotoUrl.then(function(profilePhotoUrl) {
                        return Parse.Cloud.run('updateFacebookDataCopy', {
                            'basicFacebookData': basicFacebookData,
                            'thumbnailUrl': thumbnailUrl,
                            'profilePhotoUrl': profilePhotoUrl
                        }).then(
                            function onSuccess(updatedParseUser) {
                                return currentParseUser.save({
                                    'publicFacebookData': {
                                        'facebookUserId': basicFacebookData.id,
                                        'facebookProfileUrl': basicFacebookData.link,
                                        'fullName': basicFacebookData.name,
                                        /* jshint ignore:start */
                                        'firstName': basicFacebookData.first_name,
                                        'lastName': basicFacebookData.last_name,
                                        'updatedTime': basicFacebookData.updated_time,
                                        /* jshint ignore:end */
                                        'locale': basicFacebookData.locale,
                                        'timezone': basicFacebookData.timezone,
                                        'verified': basicFacebookData.verified,
                                        'thumbnailUrl': thumbnailUrl,
                                        'profilePhotoUrl': profilePhotoUrl
                                    }
                                }).then(function() {
                                    loginSuccessfulDeferred.resolve();
                                    var isNewLogin = true;
                                    return isNewLogin;
                                });
                            },
                            console.error.bind(console,
                                'error updating copy of facebook data')
                        );
                    });
                });
            });
        });
    }

    //function extendWithPublicFacebookData(objectToExtend, user) {
    //    objectToExtend.basicFacebookData = user.get('facebookData');
    //}

    function getFacebookProfilePhotoUrl(userId, width, height) {
        var apiUrl = '/' + userId + '/picture';

        if (width && height) {
            apiUrl += '?width=' + width + '&height=' + height;
        }

        return $q(function(resolve, reject) {
            promiseLoadFacebookSdk.then(function(fbSdk) {
                fbSdk.api(apiUrl, function(response) {
                    if (response && !response.error) {
                        resolve(response.data.url);
                    } else {
                        console.log(response.error);
                    }
                });
            });
        });
    }

    function logout() {
        Parse.User.logOut();
        $window.location = '/';
        //return $window.FB.logout();
    }

    function logIntoParseWithFacebook() {
        return $q(function(resolve, reject) {
            promiseLoadFacebookSdk.then(function() {
                Parse.FacebookUtils.logIn(
                    'public_profile, email, user_friends', {
                        success: resolve.bind(),
                        error: function(errorMsg) {
                            console.error('Facebook error message: ',errorMsg);
                            reject();
                        }
                    }
                );
            });
        });
    }

    function verifyFacebookUserMatchesLoggedInUser() {
        return promiseLoadFacebookSdk.then(function(fbSdk) {
            var facebookStatusDeferred = $q.defer();
            $window.FB.getLoginStatus(function(response) {
                facebookStatusDeferred.resolve(response);
            });
            return facebookStatusDeferred.promise.then(function(status) {
                if (getFacebookIdFromParse() !== status.authResponse.userID) {
                    return $q.reject();
                }
            });
        });
    }

    function loadAndInitializeFacebookSdk() {

        return $q(function(resolve, reject) {
            $window.fbAsyncInit = function() {
                Parse.FacebookUtils.init({
                    //localhost appId
                    //appId          : '900144096737151',

                    //futureprojectdev.parseapp.com
                    appId: 910868352331392,

                    //futureproject.parseapp.com appId
                    //appId      : '867899246628303',

                    cookie     : true,  // enable cookies to allow Parse to access the session
                    version    : 'v2.2',
                    xfbml      : true,  // initialize Facebook social plugins on the page
                    /*
                    //status interferes with Parse
                    status     : true,
                    */
                });
                resolve($window.FB);
            };

          (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)){return;}
            js = d.createElement(s); js.id = id;
            js.src = '//connect.facebook.net/en_US/sdk.js';
            fjs.parentNode.insertBefore(js, fjs);
          }($window.document, 'script', 'facebook-jssdk'));

        });
    }

}

})();
