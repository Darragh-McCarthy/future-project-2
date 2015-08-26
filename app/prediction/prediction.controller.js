(function() {
'use strict';

angular.module('myApp')
    .controller('Prediction', Prediction);

Prediction.$inject = ['PredictionService', '$stateParams', 'JudgementService', 'UserAuth'];
function Prediction(PredictionService,  $stateParams,  JudgementService, UserAuth) {

    scroll(0, 0);

    var _this = this;
    _this.isReasonsListVisible = true;
    _this.onDeletePredictionSuccess = onDeletePredictionSuccess;

    PredictionService.getPredictionById($stateParams.predictionId)
    .then(function(prediction) {
        _this.prediction = prediction;
    });

    function onDeletePredictionSuccess() {
        _this.isReasonsListVisible = false;
    }
}

})();
