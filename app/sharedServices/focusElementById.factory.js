(function(){
'use strict';

angular.module('myApp')
  .factory('focusElementById', focusElementById);


focusElementById.$inject=['$timeout'];
function focusElementById( $timeout ) {
    return function(id, minScreenSize) {
      var MIN_AUTOFOCUS_SCREEN_WIDTH = 600;

      //prevent keyboard popups on small screens
      minScreenSize = minScreenSize || MIN_AUTOFOCUS_SCREEN_WIDTH;
      if (minScreenSize && window.innerWidth <= minScreenSize) {
        return;
      }
      $timeout(function() {
        var element = document.getElementById(id);
        if(element) {
          element.focus();
        }
        else {
          console.log('focus element failed: ' + id + 'does not exist');
        }

      });
    };
  }


})();