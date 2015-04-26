var app = angular.module("phoneApp", []);

app.controller("AppCtrl", function() {
    var appctrl = this;
    appctrl.callHome = function(message) {
        alert(message);
    };
});

app.directive("phone", function() {
    return {
        scope: {
            dial: "&"
        },
        template: '<input type="text" ng-model="value">' +
          '<div class="button" ng-click="dial({message:value})">Call home!</div>'
    };
});


  <div ng-app="phoneApp">
    <!-- we've replaced the use of $scope with the preferred "controller as" syntax. see:http://toddmotto.com/digging-into-angulars-controller-as-syntax/ -->
    <div ng-controller="AppCtrl as appctrl">
        <div phone dial="appctrl.callHome(message)"></div>
        <div phone dial="appctrl.callHome(message)"></div>
        <div phone dial="appctrl.callHome(message)"></div>
    </div>
  </div>