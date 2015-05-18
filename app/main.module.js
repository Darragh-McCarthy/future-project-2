(function(){
'use strict';





angular
  .module('myApp', [
    'ngResource',
    'myApp.sharedServices',
    'parse-angular',
    'ui.router'
  ])
  .config(mainConfigurations)
  .constant('_', _);





mainConfigurations.$inject=['$compileProvider'];
function mainConfigurations( $compileProvider ) {
  //$compileProvider.debugInfoEnabled(false);
}



})();