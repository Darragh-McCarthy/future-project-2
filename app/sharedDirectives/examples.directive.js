
/*
app.directive("enter", function() {
    return function(scope, element, attrs) {
        element.bind("mouseenter", function() {
            scope.$apply(attrs.enter);
        });
    };
});
*/




/*
var app = angular.module("choreApp", []);

app.controller("ChoreCtrl", function() {
    var choreCtrl = this; 
    choreCtrl.logChore = function(chore) {
        alert(chore + " is done!");
    };
});

app.directive("kid", function() {
    return {
        restrict: "E",
        scope: {
            done: "&"
        },
        template: '<input type="text" ng-model="chore">' +
          ' {{chore}}' +
          ' <div class="button" ng-click="done({chore:chore})">I\'m done!</div>'
    };
});



<div ng-controller="ChoreCtrl as choreCtrl">
        <kid done="choreCtrl.logChore(chore)"></kid>
    </div>









angular.module("app", [])

    .directive("note", function note() {
        return {
            scope: {
                message: "@"
            },
            bindToController: true,
            controller: "NoteCtrl as note",
            template: "<div>{{note.message}}</div>"
        };
    })

    .controller("NoteCtrl", function NoteCtrl() {
        var note = this;
    })

    .directive("pad", function pad() {
        return {
            scope: {
                message: "@"
            },
            bindToController: true,
            controller: "PadCtrl as pad",
            template: "<div>{{pad.message}}</div>"
        };
    })

    .controller("PadCtrl", function PadCtrl() {
        var pad = this;
    });

*/







/*

var app = angular.module("app", []);

app.directive("dumbPassword", function() {
    var validElement = angular.element("<div>{{model.input}}</div>");

    //in the video, I accidentally typed "this.link". "this" in a directive is "Window". Instead, use "var link" as shown below. 
    var link = function(scope) {
        scope.$watch("model.input", function(value) {
            if (value === "password") {
                validElement.toggleClass("alert-danger alert");
            }
        });
    };

    return {
        restrict: "E",
        replace: true,
        template: "<div>\n  <input type=\"text\" ng-model=\"model.input\">\n  \n  \n<div>",
        compile: function(tElem) {
            tElem.append(validElement);

            return link;
        }
    };
});

*/