(function(){
'use strict';




angular
	.module('myApp.sharedServices')
	.factory('currentUser', currentUser);




currentUser.$inject=['$q','$window','$timeout','Parse'];
function currentUser( $q,  $window,  $timeout,  Parse ) {

	var facebookBigProfilePictureWidth = 200;
	var facebookBigProfilePictureHeight = 200;
	var _whenFacebookSdkLoaded = loadAndInitializeFacebookSdk();
	var _whenLoggedIn = $q.defer();
	var _user = Parse.User.current();

	var currentUserObject = {
		'loginWithFacebook': loginWithFacebook,
		'logout': logout,
		'isLoggedIn': isLoggedIntoParse,
		'copyOfBasicFacebookUserData': null,
		'userThumbnailUrl': null,
		'userId': null
	};

	if (_user) {
		currentUserObject.userId = _user.id;
		currentUserObject.copyOfBasicFacebookUserData = _user.get('copyOfBasicFacebookUserData'); 
		getUserThumbnailUrl().then(function(url){ 
			currentUserObject.userThumbnailUrl = url;
		});
		getUserBigPictureUrl().then(function(url){
			currentUserObject.userBigPictureUrl = url;
		})
	}
	return currentUserObject;



	function getBasicFacebookUserData() {
		return $q(function(resolve, reject){
			_whenFacebookSdkLoaded.then(function(){
				$window.FB.api('/me', function(response) {
					console.log(response);
					if (response.error){
						reject();
					} else {
						resolve(response);
					}
			 	});
			});
		})		
	}



	function getFacebookIdFromParse() {
		return Parse.User.current().attributes.authData.facebook.id;
	}

	function loginWithFacebook() {
		return logIntoParseWithFacebook().then(function() {
			_user = Parse.User.current();
			currentUserObject.userId = _user.id;

			if ( ! _user.copyOfBasicFacebookUserData) {
				getBasicFacebookUserData().then(function(data){
					_user.set('copyOfBasicFacebookUserData', data);
					_user.save().then(function(){
						console.log('successfully saved FB data to Parse');
						console.log('copyOfBasicFacebookUserData:',_user.get('copyOfBasicFacebookUserData'));
					});
				});
			}
			getUserThumbnailUrl().then(function(url) {
				currentUserObject.userThumbnailUrl = url;
			});
		});
	}





	function getUserThumbnailUrl() {
		return $q(function(resolve, reject) {
			if (_user) {
				var url = _user.get('userThumbnailUrl');
				if (url) {
					resolve(url);
				} else {
					getFacebookUserProfilePictureUrl(getFacebookIdFromParse()).then(function(url) {
						_user.save({'userThumbnailUrl': url});
						resolve(url);
					});
				}
			}
		});
	}
	function getUserBigPictureUrl() {
		return $q(function(resolve, reject) {
			if (_user) {
				var url = _user.get('userBigPictureUrl');
				if (url) {
					resolve(url);
				} else {
					getFacebookUserProfilePictureUrl(getFacebookIdFromParse(), facebookBigProfilePictureWidth, facebookBigProfilePictureHeight).then(function(url) {
						_user.save({'userBigPictureUrl': url});
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
			_whenFacebookSdkLoaded.then(function( fbSdk ){
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
		return !! Parse.User.current();
	}

	function logout() {
		Parse.User.logOut();
		FB.logout(function(response) {
      console.log('logging out of Facebook',response);
    });
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
		    	appId			 : '900144096737151',//localhost
		      //appId      : '867899246628303',//futureproject.parseapp.com
		      cookie     : true,  // enable cookies to allow Parse to access the session
		      version    : 'v2.2',
		      xfbml      : true,  // initialize Facebook social plugins on the page
		      //status     : true,  // check Facebook Login status; disabled as it supposedly interferes with Parse
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
						resolve(response.status === 'connected');
					});
			});
		})
	}


	




}














})();