(function(){
'use strict';




angular
	.module('myApp.sharedServices')
	.factory('currentUser', currentUser);




currentUser.$inject=['$q','$window','$timeout','Parse'];
function currentUser( $q,  $window,  $timeout,  Parse ) {

	var ParsePrivateUserDataModel = Parse.Object.extend('PrivateUserData');

	var isUserLoggedIntoFacebookAndParse;
	var facebookBigProfilePictureWidth = 200;
	var facebookBigProfilePictureHeight = 200;
	var _whenFacebookSdkLoaded = loadAndInitializeFacebookSdk();
	var _whenLoggedIn = $q.defer();

	var currentUserObject = {
		'loginWithFacebook': loginWithFacebook,
		'logout': logout,
		'isLoggedIn': isLoggedIntoParse,
		'copyOfBasicFacebookUserData': null,
		'userThumbnailUrl': null,
		'userId': null
	};

	(function(){
		var currentUser = Parse.User.current();
		if (currentUser) {
			currentUserObject.userId = currentUser.id;
			currentUserObject.copyOfBasicFacebookUserData = currentUser.get('copyOfBasicFacebookUserData');
			getUserThumbnailUrl().then(function(url){ 
				currentUserObject.userThumbnailUrl = url;
			});
			getUserBigPictureUrl().then(function(url){
				currentUserObject.userBigPictureUrl = url;
			})
		}
	})();

	return currentUserObject;



	function getBasicFacebookUserData() {
		return $q(function(resolve, reject){
			return _whenFacebookSdkLoaded.then(function(){
				$window.FB.api('/me', function(response) {
					if (response.error){
						reject();
					} else {
						resolve(response);
					}
			 	});
			});
		}).catch(console.log.bind(console));	
	}

	function getFacebookIdFromParse() {
		return Parse.User.current().attributes.authData.facebook.id;
	}

	function loginWithFacebook() {
		return logIntoParseWithFacebook().then(function(currentUser) {
			currentUserObject.userId = currentUser.id;

			getUserThumbnailUrl().then(function(url) {
				currentUserObject.userThumbnailUrl = url;
			});

			return getBasicFacebookUserData().then(function(facebookData){
				var publicUserData = {
					'first_name': facebookData.first_name,
					'last_name': facebookData.last_name,
					'id': facebookData.id,
					'link': facebookData.link,
					'updated_time': facebookData.updated_time,
					'locale': facebookData.locale,
					'name': facebookData.name,
					'timezone': facebookData.timezone,
					'verified': facebookData.verified,
				};

				var privateFacebookData = currentUser.get('privateFacebookData');
				if ( ! privateFacebookData) {
					privateFacebookData = new ParsePrivateUserDataModel;
					privateFacebookData.setACL(currentUser);
				}
				privateFacebookData.set('email', facebookData.email);
				privateFacebookData.set('gender', facebookData.gender);
				return currentUser.save({
					'privateFacebookData': privateFacebookData,
					'copyOfBasicFacebookUserData': publicUserData
				});
			});
		});
	}

	function getUserThumbnailUrl() {
		return $q(function(resolve, reject) {
			var currentUser = Parse.User.current();
			if (currentUser) {
				var url = currentUser.get('userThumbnailUrl');
				if (url) {
					resolve(url);
				} else {
					getFacebookUserProfilePictureUrl(getFacebookIdFromParse()).then(function(url) {
						currentUser.save({'userThumbnailUrl': url});
						resolve(url);
					});
				}
			}
		});
	}
	function getUserBigPictureUrl() {
		return $q(function(resolve, reject) {
			var currentUser = Parse.User.current();
			if (currentUser) {
				var url = currentUser.get('userBigPictureUrl');
				if (url) {
					resolve(url);
				} else {
					getFacebookUserProfilePictureUrl(getFacebookIdFromParse(), facebookBigProfilePictureWidth, facebookBigProfilePictureHeight).then(function(url) {
						currentUser.save({'userBigPictureUrl': url});
						resolve(url);
					});
				}
			}
		});
	}
	function getFacebookUserProfilePictureUrl(userId, width, height) {
		var apiUrl = "/" + userId + "/picture";

		if (width && height) {
			apiUrl += '?width=' + width + '&height=' + height;
		}

		return $q(function(resolve, reject) {
			_whenFacebookSdkLoaded.then(function( fbSdk ) {
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

	function isLoggedIntoParse() {
		return $q(function(resolve, reject) {
			if (typeof isUserLoggedIntoFacebookAndParse !== 'undefined') {
				console.log(isUserLoggedIntoFacebookAndParse);
				resolve(isUserLoggedIntoFacebookAndParse);
			}
			else {
				isLoggedInToFacebook().then(function(response){
					var currentParseUser = Parse.User.current();
					var currentFacebookUserId;
					var savedFacebookId;
					if (response && response.authResponse && response.authResponse.userID) {
						currentFacebookUserId = response.authResponse.userID;
					}
					if (currentParseUser) {
						savedFacebookId = currentParseUser.get('copyOfBasicFacebookUserData').id;
					}
					var areUserIdsMatching = (currentFacebookUserId === savedFacebookId);

					if ( ! areUserIdsMatching ) {
						Parse.User.logOut();
					}
					isUserLoggedIntoFacebookAndParse = areUserIdsMatching;
					resolve(areUserIdsMatching);
				});

			}
		});
	}

	function logout() {
		Parse.User.logOut();
		return FB.logout();
	}

	function logIntoParseWithFacebook() {
		return $q(function(resolve, reject){
			_whenFacebookSdkLoaded.then(function(){
				Parse.FacebookUtils.logIn('public_profile,email,user_friends', {
		      		success: function(user) {
		 	    		resolve(user);
		      		},
		      	 	error: function(user, error) {
		      			reject();
			    	}
			    });
			});
		});
	}

	function loadAndInitializeFacebookSdk() {

		return $q(function(resolve, reject) {
			$window.fbAsyncInit = function() {
		    Parse.FacebookUtils.init({
		   		//localhost appId
				appId			 : '900144096737151',
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

	function isLoggedInToFacebook(){
		return $q(function(resolve, reject) {
			_whenFacebookSdkLoaded.then(function(fbSdk) {
				fbSdk.getLoginStatus(function(response) {
					console.log(response);
					resolve(response);
				});
			});
		})
	}

}














})();