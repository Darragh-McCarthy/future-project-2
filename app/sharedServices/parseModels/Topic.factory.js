(function(){
	'use strict';



angular
	.module('myApp.sharedServices')
	.factory('Topic',Topic);


Topic.$inject=['parse'];
function Topic( parse ) {
	//parse.Object.extend("Topic");
	return {
		'getTopics': getTopics
	};

	function getTopics(){
		return [
			{'title':'Technology', 'imageUrl':''}, 
			{'title':'Science', 'imageUrl':''}, 
			{'title':'Space travel', 'imageUrl':''}, 
			{'title':'TV and Film', 'imageUrl':''}, 
			{'title':'Medicine', 'imageUrl':''}, 
			{'title':'Robotics', 'imageUrl':''}, 
			{'title':'Music', 'imageUrl':''}, 
			{'title':'Artificial Intelligence', 'imageUrl':''}, 
			{'title':'Politics', 'imageUrl':''}, 
			{'title':'Entertainment', 'imageUrl':''}, 
			{'title':'Startups', 'imageUrl':''}, 
			{'title':'Celebrities', 'imageUrl':''}
		];
	}
}




})();