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
    .state('app.header', {
      url: '/',
      views: {
        'header@': {
          templateUrl: 'header/header.html'
        }
      }
    })
    .state('app.search', {
      url: 'search?q&page',
      views: {
        'content@': {
          templateUrl: 'prediction-list/prediction-list.html', 
          controller: 'PredictionList as predictionList'
        }
      }
    })


    .state('app.make-prediction', {
      url: 'make-prediction?topic=',
      views: {
        'content@': {
          templateUrl: 'make-prediction/make-prediction.html',
          controller: 'MakePrediction as makePrediction'
        },
        'header@': {
          template: '<a class="header__back-button" ui-sref="app">◃ Back to all predictions</a>'
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
    .state('app.user-profile', {
      url: 'user-profile/:userId',
      views: {
        'content@': {
          templateUrl:'user-profile/user-profile.template.html',
          controller: 'UserProfile as userProfile'
        },
      },

    })
    .state('app.prediction-guidelines', {
      url: 'prediction-guidelines',
      views: {
        'content@': {
          templateUrl: 'prediction-guidelines.template.html'
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