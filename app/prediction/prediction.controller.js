(function() {
'use strict';

angular.module('myApp')
    .controller('Prediction', Prediction);

Prediction.$inject = ['PredictionService', '$stateParams', 'JudgementService', 'UserAuth'];
function Prediction(PredictionService,  $stateParams,  JudgementService, UserAuth) {

    scroll(0, 0);

    var _this = this;

    PredictionService.getPredictionById($stateParams.predictionId)
    .then(function(prediction) {
        _this.prediction = prediction;
    });

    PredictionService.getAuthorOfPredictionById($stateParams.predictionId)
    .then(function(author) {
        _this.predictionAuthor = author;
        console.log(author);
        return author;
    });

    JudgementService.getReasonsForPrediction($stateParams.predictionId)
    .then(function(judgementWithReasons) {
        _this.judgementsWithReasonsCount = judgementWithReasons.length;

        var currentUser = UserAuth.getCurrentUser();
        _this.judgementsWithReasons = judgementWithReasons.filter(function(judgement) {
            if (currentUser) {
                return judgement.authorId !== currentUser.id;
            }
            return true;
        });

/*
        _this.judgementsWithReasons.push({
            'reasonText':'I\'m not sure but my friend thinks so',
            'likelihoodPercent':50
        });
        _this.judgementsWithReasons.push({
            'reasonText':'because something will happen that makes it so',
            'likelihoodPercent':50
        });
        _this.judgementsWithReasons.push({
            'reasonText':'because it is obvious',
            'likelihoodPercent':50
        });

        _this.judgementsWithReasons.push({
            'reasonText':'because well thatis life and you know',
            'likelihoodPercent':50
        });
        _this.judgementsWithReasons.push({
            'reasonText':'I dont think so. Theres no way',
            'likelihoodPercent':50
        });
        _this.judgementsWithReasons.push({
            'reasonText':'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries,',
            'likelihoodPercent':30

        });
        _this.judgementsWithReasons.push({
            'reasonText':'but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
            'likelihoodPercent':80
        });
*/

    });
}

})();
