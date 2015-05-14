(function(){
'use strict';


angular.module('myApp')
.directive('fpPrediction', function() {
	return {
		templateUrl: 'sharedDirectives/prediction.template.html',
		scope: {
			prediction: '=',
      topicToHide: '=',
      onexpand: '&onexpand'
		},
		bindToController: true,
		controller: 'Prediction as predictionCtrl',
		//link: function(scope, element, attrs) {
		//	console.log(typeof attrs.prediction)
		//}
	}
});


angular.module('myApp')
	.controller('Prediction', Prediction);

Prediction.$inject=['PredictionService'];
function Prediction( PredictionService ) {
	var predictionCtrl = this;
  predictionCtrl.toggleLikelihoodEstimate = toggleLikelihoodEstimate;
  predictionCtrl.addLikelihoodEstimate = addLikelihoodEstimate;
  predictionCtrl.removeLikelihoodEstimate = removeLikelihoodEstimate;
  allocateGraphBarHeights(predictionCtrl.prediction.communityEstimates);


  (function removeTopicFromPredictions() {
    if (predictionCtrl.topicToHide) {
      for (var i = 0; i < predictionCtrl.prediction.topics.length; i++) {
        if (predictionCtrl.prediction.topics[i].title === predictionCtrl.topicToHide) {
          var index = predictionCtrl.prediction.topics.indexOf(predictionCtrl.prediction.topics[i]);
          predictionCtrl.prediction.topics.splice(index, 1);
        }
      }
    }
  })();

  function toggleLikelihoodEstimate(prediction, percent){
    if (prediction.userEstimate === percent) {
      removeLikelihoodEstimate(prediction, percent);
    } else {
      addLikelihoodEstimate(prediction, percent);
    }
  }
  function addLikelihoodEstimate(prediction, percent) {
    predictionCtrl.onexpand();
    prediction.isExpanded = true;

    PredictionService
      .addLikelihoodEstimate(prediction.id, percent)
      .then(function(updatedPrediction){
        prediction.communityEstimates = updatedPrediction.communityEstimates;
        prediction.communityEstimatesCount = updatedPrediction.communityEstimatesCount;
        prediction.userEstimate = percent;
        allocateGraphBarHeights(prediction.communityEstimates);
      })
    ;
  }
  function removeLikelihoodEstimate(prediction, percent) {
    prediction.userEstimate = null;
  }
  function allocateGraphBarHeights(communityEstimates) {
    var maximumHeight = 100;
    var minimumHeight = 5;
    var largestCount = 0;

    angular.forEach(communityEstimates, function(estimate) {
      if (estimate.count > largestCount) {
        largestCount = estimate.count;
      }
    });

    angular.forEach(communityEstimates, function(estimate) {
      var graphBarHeight = minimumHeight;
      if (estimate.count > 0 ) {
        graphBarHeight = maximumHeight / largestCount * estimate.count;
      }
      estimate.graphBarHeight = {'height':graphBarHeight + 'px'};
    });

  }
}

})();


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