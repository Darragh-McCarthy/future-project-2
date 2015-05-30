module.exports = function(config){
  config.set({
    files : [
      'app/bower_components/lodash/lodash.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/parse-angular-patch/src/parse-angular.js',
      'app/bower_components/angular-ui-router/release/angular-ui-router.js',
      'app/**/*.module.js',
      'app/**/*.controller.js',
      'app/**/*.directive.js',
      'app/**/*.factory.js',
      'app/**/*.spec.js'
    ],
    autoWatch : true,
    frameworks: ['jasmine'],
    browsers : ['Chrome'],
    plugins : [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-jasmine',
      'karma-junit-reporter',
      'karma-coverage'
    ],
    reporters: ['progress','coverage'],
    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    },
    coverageReporter: {
      reporters: [
        { type: 'html', dir: 'coverage/' }
      ]
    },
    preprocessors: {
      '**/*.module.js': 'coverage',
      '**/*.controller.js': 'coverage',
      '**/*.directive.js': 'coverage',
      '**/*.factory.js': 'coverage'
    },

  });
};