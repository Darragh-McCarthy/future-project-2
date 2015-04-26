var app = angular.module("app", []);

app.directive("zippy", function() {
    return {
        restrict: "E",
        transclude: true,
        scope: {
            title: "@"
        },
        template: '<div>\n  <h3 ng-click="toggleContent()">{{title}}</h3>\n  <div ng-show="isContentVisible" ng-transclude></div>\n<div>',
        link: function(scope) {
            scope.isContentVisible = false;

            scope.toggleContent = function() {
                scope.isContentVisible = !scope.isContentVisible;
            };
        }
    };
});

  <div ng-app="app">
    <input type="text" ng-model="model.title">
    <input type="text" ng-model="model.content">

    <zippy title="{{model.title}}">
        The content is: {{model.content}}
    </zippy>
  </div>