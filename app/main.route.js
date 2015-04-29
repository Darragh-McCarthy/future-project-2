(function(){
'use strict';






angular.module('myApp')
  .config(configureRoutes)
  .run(logStateChangeErrors)
  .run(conditionalRedirectToLogin);








configureRoutes.$inject=['$stateProvider','$urlRouterProvider'];
function configureRoutes( $stateProvider,  $urlRouterProvider ) {

  
  $stateProvider
    .state('app', {
      url: '/',
      views: {
        'header': { 
          templateUrl: 'header/header.html',
          controller: 'Header as header'
        },
        'content': {
          templateUrl: 'prediction-list/prediction-list.html', 
          controller: 'PredictionList as predictionList'
        }
      }
    })
    .state('app.search', {
      url: 'search?q=searchQuery',
      views: {
        'content@': {
          templateUrl: 'prediction-list/prediction-list.html', 
          controller: 'PredictionList as predictionList'
        }
      }
    })
    .state('app.topic', {
      url: 'topic/:topic',
      views: {
        'content@': {
          templateUrl: 'prediction-list/prediction-list.html', 
          controller: 'PredictionList as predictionList'
        }
      }
    })

    .state('app.make-prediction', {
      url: 'make-prediction',
      views: {
        'content@': {
          templateUrl: 'make-prediction/make-prediction.html',
          controller: 'MakePrediction as makePrediction'
        },
        'header@': {
          template: '<a class="back-button" ui-sref="app"> < back</a>'
        }
      }
    })
    .state('app.login', {
      url: 'login',
      views: {
        'header@': {},
        'content@': {
          templateUrl: 'login/login.html',
          controller: 'Login as login'
        }
      }
    })
    .state('app.browse-topics', {
      url: 'browse-topics',
      views: {
        'content@': {
          templateUrl: 'browseTopics/browseTopics.html',
          controller: 'BrowseTopics as browseTopics'
        }
      }
    })
  ;

  $urlRouterProvider.otherwise('/');
}





logStateChangeErrors.$inject=['$rootScope'];
function logStateChangeErrors( $rootScope ) {
    $rootScope.$on("$stateChangeError", 
      console.log.bind(console)
    );
}


conditionalRedirectToLogin.$inject=['$rootScope','$location','$state','currentUser'];
function conditionalRedirectToLogin( $rootScope,  $location,  $state,  currentUser) {

    $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {

      if ( ! currentUser.isLoggedIn() && toState.name !== "app.login" ) {
        e.preventDefault();
        $state.go('app.login');
      }

    });
}


})();