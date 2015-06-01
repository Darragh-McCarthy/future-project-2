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
        'content': {}
      }
    })
    .state('app.recent', {
      url: 'recent/:page',
      views: {
        'content@': {
          templateUrl: 'prediction-list/prediction-list.html', 
          controller: 'PredictionList as predictionList'
        }
      }
    })
    .state('app.browse-topics', {
      url: 'browse-topics',
      views: {
        'content@': {
          templateUrl: 'browseTopics/browseTopics.template.html',
          controller: 'BrowseTopics as browseTopics'
        }
      }
    })
    .state('app.topic', {
      url: 'topic/:topic/:page',
      views: {
        'content@': {
          templateUrl: 'prediction-list/prediction-list.html', 
          controller: 'PredictionList as predictionList'
        }
      }
    })
    .state('app.prediction', {
      url: 'prediction/:predictionId',
      views: {
        'content@': {
          templateUrl:'prediction/prediction.template.html',
          controller:'Prediction as prediction'
        }
      }
    })
    .state('app.make-prediction', {
      url: 'make-prediction?topic=',
      views: {
        'content@': {
          templateUrl: 'make-prediction/make-prediction.html',
          controller: 'MakePrediction as makePrediction',
          resolve: { 'previousState': getPreviousState },
        },
        'header@': {}

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
      url: 'user-profile/:userId/:page',
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
          templateUrl: 'pages/prediction-guidelines.template.html'
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


getPreviousState.$inject=["$state"]
function getPreviousState($state) {
  var currentStateData = null;
  if ($state.current && $state.current.name) {
    var currentStateData = {
      name:   $state.current.name,
      params: $state.params,
      url:    $state.href($state.current.name, $state.params)
    };
  }
  return currentStateData;
}



})();