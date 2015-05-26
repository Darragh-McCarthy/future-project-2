(function(){
'use strict';

angular.module('myApp')
	.factory('UserService', UserService);

UserService.$inject=['Parse'];
function UserService( Parse ) {

	return {
		'castParseUserAsPlainObject':castParseUserAsPlainObject
	}

	function castParseUserAsPlainObject(parseUser){
		return {
			'id':parseUser.id,
			'copyOfBasicFacebookUserData':parseUser.get('copyOfBasicFacebookUserData'),
			'userThumbnailUrl':parseUser.get('userThumbnailUrl')
		}
		
	}

}

})();