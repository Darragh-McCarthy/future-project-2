(function() {
'use strict';

var FOCUS_ON_HOVER_ATTRIBUTE = 'focusOnHover';

angular.module('myApp')
    .directive('input', FocusTextInputOnMouseover)
    .directive('textarea', FocusTextareaOnMouseover);

function FocusTextInputOnMouseover() {
    return function(scope, element, attrs) {
        angular.forEach(attrs, function(a, key) {
            if (key === 'type' && attrs[key] === 'text') {
                element.on('mouseover', function() {
                    var isFocusOnHoverDisabled = false;
                    angular.forEach(attrs, function(a, key) {
                        if (key === FOCUS_ON_HOVER_ATTRIBUTE && attrs[key] === 'false') {
                            isFocusOnHoverDisabled = true;
                        }
                    });
                    if (isFocusOnHoverDisabled) {
                        return;
                    }
                    element[0].focus();
                });
            }
        });
    };
}

function FocusTextareaOnMouseover() {
    return function(scope, element, attrs) {
        element.on('mouseover', function() {
            var isFocusOnHoverDisabled = false;
            angular.forEach(attrs, function(a, key) {
                if (key === FOCUS_ON_HOVER_ATTRIBUTE && attrs[key] === 'false') {
                    isFocusOnHoverDisabled = true;
                }
            });
            if (isFocusOnHoverDisabled) {
                return;
            }
            element[0].focus();
        });
    };
}

})();
