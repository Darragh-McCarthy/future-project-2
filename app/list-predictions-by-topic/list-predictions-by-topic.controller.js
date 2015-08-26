(function() {
'use strict';

angular.module('myApp')
    .controller('ListPredictionsByTopic', ListPredictionsByTopic);

ListPredictionsByTopic.$inject = ['PredictionService', '$stateParams'];
function ListPredictionsByTopic(PredictionService,  $stateParams) {

    if (!$stateParams.topic) {
        return console.error('$stateParams.topic required');
    }

    var _this = this;
    _this.getPredictions = getPredictions;
    _this.topic = $stateParams.topic;
    _this.page = Number($stateParams.page) || 0;

    function getPredictions(numPredictions, numPredictionsToSkip) {
        console.warn('pagination not implemented');
        return PredictionService.getPredictionsByTopicTitle(_this.topic);
    }
}

})();
