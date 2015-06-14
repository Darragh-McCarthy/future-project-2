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
      url: '',
      abstract: true,
      views: {
        'content': {},
        /*'logo': { template:'<div class="header__logo-container">' +
                          '<div class="header__logo"></div>' + 
                          '<a class="social-icon-link" href="#">' +
                          'Social icon<!--click one icon to be taken to a page that displays all accounts.' +
                          'Icon disappears if you clicked through all the social media links-->' +
                          '</a></div>' },*/
        'header': { 
          templateUrl: 'header/header.html',
          controller: 'Header as header',
        }/*,
        'footer': {
          template:'<div class="main-fixed-footer">footer here</div>'
        }*/
      }
    })
    .state('app.recent', {
      url: '/recent/:page',
      views: {
        'content@': {
          templateUrl: 'prediction-list/prediction-list.html', 
          controller: 'PredictionList as predictionList'
        }
      }
    })
    .state('app.browse-topics', {
      url: '/browse-topics',
      views: {
        'content@': {
          templateUrl: 'browseTopics/browseTopics.template.html',
          controller: 'BrowseTopics as browseTopics'
        }
      }
    })
    .state('app.topic', {
      url: '/topic/:topic/:page',
      views: {
        'content@': {
          templateUrl: 'prediction-list/prediction-list.html', 
          controller: 'PredictionList as predictionList'
        }
      }
    })
    .state('app.prediction', {
      url: '/prediction/:predictionId',
      views: {
        'content@': {
          templateUrl:'prediction/prediction.template.html',
          controller:'Prediction as prediction'
        }
      }
    })
    .state('app.make-prediction', {
      url: '/make-prediction?topic=',
      views: {
        'logo@': {},
        'content@': {
          templateUrl: 'make-prediction/make-prediction.html',
          controller: 'MakePrediction as makePrediction',
          resolve: { 'previousState': getPreviousState },
        }
      }
    })
    .state('app.login', {
      url: '/login',
      views: {
        'header@': {},
        'logo@': {},
        'content@': {
          templateUrl: 'login/login.html',
          controller: 'Login as login'
        }
      }
    })
    .state('app.user-profile', {
      url: '/user-profile/:userId/:page',
      views: {
        'content@': {
          templateUrl:'user-profile/user-profile.template.html',
          controller: 'UserProfile as userProfile'
        },
      },
    })
    .state('app.prediction-guidelines', {
      url: '/prediction-guidelines',
      views: {
        'content@': {
          templateUrl: 'pages/prediction-guidelines.template.html'
        }
      }
    });

    $urlRouterProvider.otherwise( function($injector, $location) {
      var $state = $injector.get("$state");
      $state.go("app.recent");
    });
}





logStateChangeErrors.$inject=['$rootScope'];
function logStateChangeErrors( $rootScope ) {
    $rootScope.$on("$stateChangeError", console.log.bind(console));
}

conditionalRedirectToLogin.$inject=['$rootScope','$location','$state','currentUser'];
function conditionalRedirectToLogin( $rootScope,  $location,  $state,  currentUser) {
  $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
      if ( ! currentUser.isLoggedIn() && toState.name !== "app.login" ) {
        $state.go('app.login');
        e.preventDefault();
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