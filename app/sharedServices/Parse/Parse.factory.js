(function() {
'use strict';

angular.module('myApp.sharedServices')
    .factory('Parse', ParseService);

ParseService.$inject = ['$window'];
function ParseService($window) {
    /*
    //futureProjectDev
    $window.Parse.initialize('tkoete7doYZNLOPCt3rL251l69WBSNlbwk4PAJ3L',
        'ig9sn2CYO4JUeFAJSG8TTZa4NmRwrG4Iq2VRmhhD');
    */
    //futureProject
    $window.Parse.initialize('0nGBcRg8yPjDYH8KzitgIYauoF4ZT6CV369pWPZu',
        'P0FjDZHyVrS4ZlxRfrr3FPxsWrtXwLD7v6RFqzIK');
    return $window.Parse;
}

})();
