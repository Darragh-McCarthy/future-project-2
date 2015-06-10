(function(){
'use strict';

angular.module('myApp')
	.factory('UserService', UserService);

UserService.$inject=['Parse'];
function UserService( Parse ) {

	return {
		'castParseUserAsPlainObject':castParseUserAsPlainObject,
		'getUserById':getUserById
	};

	function castParseUserAsPlainObject(parseUser){
		return {
			'id':parseUser.id,
			'copyOfBasicFacebookUserData':parseUser.get('copyOfBasicFacebookUserData'),
			'userThumbnailUrl':parseUser.get('userThumbnailUrl'),
			'userBigPictureUrl': parseUser.get('userBigPictureUrl')
		};
	}
	function getUserById(userId) {
		return new Parse.Query(Parse.User)
			.get(userId)
			.then(function(user){
				console.log(user);
				console.log(Parse.User.current());
				return castParseUserAsPlainObject(user);
			});
	}

}

})();