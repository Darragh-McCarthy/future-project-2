(function() {
'use strict';

angular.module('myApp')
  .factory('focusElementById', focusElementById);

focusElementById.$inject = ['$timeout'];
function focusElementById($timeout) {
    return function(elementId, minScreenSize) {

        var MIN_AUTOFOCUS_SCREEN_WIDTH = 600;

        //prevent keyboard popups on small screens
        minScreenSize = minScreenSize || MIN_AUTOFOCUS_SCREEN_WIDTH;
        if (minScreenSize && window.innerWidth <= minScreenSize) {
            return;
        }

        $timeout(function() {
            var el = document.getElementById(elementId);
            if (!el) {
                return console.log('#' + elementId + ' does not exist');
            }
            el.focus();
        });
    };
}

})();
