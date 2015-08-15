(function() {
'use strict';

angular.module('myApp')
    .factory('StateDataCache', StateDataCache);

StateDataCache.$inject = [];
function StateDataCache() {
    return {
        'saveState': saveState,
        'deleteState': deleteState
    };

    function saveState(stateId, data) {

    }

    function deleteState(stateId) {

    }
}

})();
