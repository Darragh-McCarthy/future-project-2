(function() {
'use strict';

angular.module('myApp')
    .controller('ListRecentPredictions', ListRecentPredictions);

ListRecentPredictions.$inject = ['PredictionService', '$stateParams'];
function ListRecentPredictions(PredictionService,  $stateParams) {
    var _this = this;
    _this.pageNumber = Number($stateParams.page) || 1;
    _this.getPredictions = getPredictions;

    function getPredictions(numPredictions, numPredictionsToSkip) {
        return PredictionService
            .getRecentPredictions(numPredictions, numPredictionsToSkip);
    }
}

})();
