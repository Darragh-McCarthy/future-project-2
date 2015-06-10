(function(){
'use strict';





angular
	.module('myApp')
	.controller('Header', Header);

Header.$inject=['currentUser','$timeout'];
function Header( currentUser,  $timeout ) {
	var _this = this;
	_this.currentUser = currentUser;
	_this.resetFeedbackText = resetFeedbackText;	
	_this.submitFeedback = submitFeedback;
	_this.topics = [
		{'title': 'Technology'},
		{'title': 'Science'},
		{'title': 'Space travel'},
		{'title': 'TV and Film'},
		{'title': 'Medicine'},
		{'title': 'Robotics'},
		{'title': 'Artificial Intelligence'},
		{'title': 'Music'},
		{'title': 'Celebrities'},
		{'title': 'Politics'},
		{'title': 'Startups'},
		{'title': 'Entertainment'}
	];

	function resetFeedbackText() {
		_this.feedbackText = '';
	}
	function submitFeedback($event) {
		$event.target.blur();
		$event.target.setAttribute('placeholder', 'Thank You!');
		_this.feedbackText = '';
		console.log(_this.feedbackText);
		$timeout(function(){
			$event.target.setAttribute('placeholder', 'Feedback');
		}, 2000);
	}

	
}






})();