(function() {
'use strict';

angular.module('myApp')
    .directive('input', FocusTextInputOnMouseover);

function FocusTextInputOnMouseover() {
    return function(scope, element, attrs) {
        angular.forEach(attrs, function(a, key) {
            if (key === 'type' && attrs[key] === 'text') {
                element.on('mouseover', function() {
                    element[0].focus();
                });
            }
        });
    };
}

})();
