(function() {
'use strict';

angular.module('myApp')
    .config(configureRoutes)
    .run(logStateChangeErrors)
    .run(redirectFromWelcomeIfIsLoggedIn)

redirectFromWelcomeIfIsLoggedIn.$inject = ['$rootScope', '$state', 'UserAuth'];
function redirectFromWelcomeIfIsLoggedIn($rootScope, $state, UserAuth) {
    $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
        if (UserAuth.isLoggedIn() && toState.name === 'app.welcome') {
            $state.go('app.recent');
            e.preventDefault();
        }
    });
}

logStateChangeErrors.$inject = ['$rootScope'];
function logStateChangeErrors($rootScope) {
    $rootScope.$on('$stateChangeError', console.log.bind(console));
}

getPreviousState.$inject = ['$state'];
function getPreviousState($state) {
    var currentStateData = null;
    if ($state.current && $state.current.name) {
        currentStateData = {
            name:   $state.current.name,
            params: $state.params,
            url:    $state.href($state.current.name, $state.params)
        };
    }
    console.log('in getPreviousState');
    return currentStateData;
}

configureRoutes.$inject = ['$stateProvider', '$urlRouterProvider'];
function configureRoutes($stateProvider,  $urlRouterProvider) {
    $stateProvider
    .state('app', {
        url: '',
        abstract: true,
        views: {
            'content': {},
            'header': {
                templateUrl: '/header/header.html',
                controller: 'Header as ctrl',
            }
        }
    })
    .state('app.welcome', {
        url: '/welcome',
        views: {
            'header@': {},
            'content@': {
                templateUrl: '/welcome/welcome.template.html',
                controller: 'Welcome as ctrl'
            }
        }
    })
    .state('app.recent', {
        url: '/recent?page=',
        views: {
            'content@': {
                templateUrl: '/list-recent-predictions/list-recent-predictions.template.html',
                controller: 'ListRecentPredictions as ctrl'
            }
        }
    })
    .state('app.follow', {
        url: '/follow',
        views: {
            'content@': {
                templateUrl: '/follow/follow.template.html',
                controller: 'FollowOffSite as ctrl'
            }
        }
    })
    /*.state('app.notifications', {
        url: '/notifications',
        views: {
            'content@': {
                templateUrl: '/notifications/notifications.template.html',
                controller: 'Notifications as ctrl'
            }
        }
    })*/
    .state('app.feedback', {
        url: '/feedback',
        views: {
            'content@': {
                templateUrl: '/feedback/feedback.template.html',
                controller: 'Feedback as ctrl'
            }
        }
    })
    .state('app.browse-topics', {
        url: '/browse-topics',
        views: {
            'content@': {
                templateUrl: '/browseTopics/browseTopics.template.html',
                controller: 'BrowseTopics as ctrl'
            }
        }
    })
    .state('app.topic', {
        url: '/topic/:topic',
        views: {
            'content@': {
                templateUrl: '/list-predictions-by-topic/list-predictions-by-topic.template.html',
                controller: 'ListPredictionsByTopic as ctrl'
            }
        }
    })
    .state('app.prediction', {
        url: '/prediction/:predictionId',
        views: {
            'content@': {
                templateUrl: '/prediction/prediction.template.html',
                controller: 'Prediction as ctrl'
            }
        }
    })
    /*
    .state('app.make-prediction', {
        url: '/make-prediction?topic=',
        views: {
            'logo@': {},
            'content@': {
                templateUrl: '/make-prediction/make-prediction.html',
                controller: 'MakePrediction as ctrl',
                resolve: {
                    'previousState': getPreviousState
                },
            }
        }
    })*/
    /*
    .state('app.login', {
        url: '/login',
        views: {
            'header@': {},
            'logo@': {},
            'content@': {
                templateUrl: '/login/login.html',
                controller: 'Login as ctrl'
            }
        }
    })*/
    .state('app.user-profile', {
        url: '/user-profile/:userId',
        views: {
            'content@': {
                templateUrl:'/user-profile/user-profile.template.html',
                controller: 'UserProfile as ctrl'

                /*controller: ['$state', function($state) {
                   $state.go('app.user-profile.notifications');
                }]*/
            },
//            'userprofiletab@app.user-profile': {}
        }
    })
    /*
    .state('app.user-profile.notifications', {
        url: '/notifications',
        views: {
            'userprofiletab@app.user-profile': {
                template:'notifications template here',
            },
        },
    })
    .state('app.user-profile.predictions', {
        url: '/predictions',
        views: {
            'userprofiletab@app.user-profile': {
                controller: 'UserProfile as ctrl',
                template:'<div class="user-profile-page__prediction-list-container">' +
                            '<fp-prediction-list ' +
                                'title="Recent predictions"' +
                                'is-add-new-prediction-hidden="true" ' +
                                'is-add-new-prediction-autofocused="true" ' +
                                'get-predictions="ctrl.getPredictions(numPredictions, numPredictionsToSkip)" '+
                                'is-prediction-loading-enabled="true"> ' +
                            '</fp-prediction-list>' +
                        '</div>'
            },
        },
    })
    .state('app.user-profile.settings', {
        url: '/settings',
        views: {
            'userprofiletab@app.user-profile': {
                template:'settings'
            },
        },
    })*/
    .state('app.prediction-guidelines', {
        url: '/prediction-guidelines',
        views: {
            'content@': {
                templateUrl: '/pages/prediction-guidelines.template.html'
            }
        }
    });

    $urlRouterProvider.otherwise(function($injector, $location) {
        var $state = $injector.get('$state');
        $state.go('app.welcome');
    });
}

})();
