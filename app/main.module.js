(function(){
'use strict';





angular
  .module('myApp', [
    'ngResource',
    'myApp.sharedServices',
    'ngAnimate',
    'parse-angular',
    'LocalForageModule',
    'ui.router'
  ])
  .config(mainConfigurations)
  .config(exceptionConfig)
  .constant('_', _);





mainConfigurations.$inject=['$compileProvider'];
function mainConfigurations( $compileProvider ) {
  //$compileProvider.debugInfoEnabled(false);
}

exceptionConfig.$inject=['$provide'];
function exceptionConfig( $provide ) {
    $provide.decorator('$exceptionHandler', extendExceptionHandler);
}
extendExceptionHandler.$inject=['$delegate'];
function extendExceptionHandler( $delegate ) {
    return function(exception, cause) {
        $delegate(exception, cause);
        var errorData = {
            exception: exception,
            cause: cause
        };
        /**
         * Could add the error to a service's collection,
         * add errors to $rootScope, log errors to remote web server,
         * or log locally. Or throw hard. It is entirely up to you.
         * throw exception;
         */
        toastr.error(exception.msg, errorData);
    };
}



})();