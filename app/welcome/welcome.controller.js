(function() {
'use strict';

angular.module('myApp')
    .controller('Welcome', Welcome);

Welcome.$inject = ['$window'];
function Welcome($window) {
    console.warn('Change welcome photo ASAP');
}

})();
