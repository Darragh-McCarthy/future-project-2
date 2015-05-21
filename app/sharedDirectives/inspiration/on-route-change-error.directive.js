/*app.directive("error", function($rootScope) {
    return {
        restrict: "E",
        template: '<div class="alert-box alert" ng-show="isError">Error!!!!</div>',
        link: function(scope) {
            $rootScope.$on("$routeChangeError", function(event, current, previous, rejection) {
                scope.isError = true;
            })
        }
    }
})
*/