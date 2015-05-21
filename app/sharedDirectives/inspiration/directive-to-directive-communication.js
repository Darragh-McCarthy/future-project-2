var app = angular.module("app", []);

app.directive("country", function() {
    return {
        restrict: "E",
        controller: function() {
            this.makeAnnouncement = function(message) {
                console.log("Country says: " + message);
            };
        }
    };
});

app.directive("state", function() {
    return {
        restrict: "E",
        require: "^country",
        controller: function() {
            this.makeLaw = function(law) {
                console.log("Law: " + law);
            };
        },
        link: function(scope, element, attrs, countryCtrl) {

        }
    };
});

app.directive("city", function() {
    return {
        restrict: "E",
        require: ["^country", "^state"],
        link: function(scope, element, attrs, ctrls) {
            ctrls[0].makeAnnouncement("from city");
            ctrls[1].makeLaw("Jump higher");
        }
    };
});












<superhero flight speed strength>Superman</superhero>


var app = angular.module("superApp", []);

// controller declared on module so it can use "controller as"
app.controller("SuperHeroCtrl", function($element) {
  var superman = this;
  
  superman.abilities = [];

  superman.addStrength = function() {
    superman.abilities.push("strength");
  };

  superman.addSpeed = function() {
    superman.abilities.push("speed");
  };

  superman.addFlight = function() {
    superman.abilities.push("flight");
  };
  
  $element.addClass("button");
  $element.bind("mouseenter", function() {
    console.log(superman.abilities);
  });
});

app.directive("superhero", function() {
    return {
        restrict: "E",
        scope: {},

        controller: "SuperHeroCtrl as superhero"
  };
});

app.directive("strength", function() {
    return {
        require: "superhero",
        link: function(scope, element, attrs, superheroCtrl) {
            superheroCtrl.addStrength();
        }
    };
});

app.directive("speed", function() {
    return {
        require: "superhero",
        link: function(scope, element, attrs, superheroCtrl) {
            superheroCtrl.addSpeed();
        }
    };
});

app.directive("flight", function() {
    return {
        require: "superhero",
        link: function(scope, element, attrs, superheroCtrl) {
            superheroCtrl.addFlight();
        }
    };
});