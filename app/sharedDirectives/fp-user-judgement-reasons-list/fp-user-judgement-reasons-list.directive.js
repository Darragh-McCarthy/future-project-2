(function() {
'use strict';

angular.module('myApp')
    .controller('FpUserJudgmentReasonsList', FpUserJudgmentReasonsList);
angular.module('myApp')
    .directive('fpUserJudgementReasonsList', fpUserJudgementReasonsList);

fpUserJudgementReasonsList.$inject = [];
function fpUserJudgementReasonsList() {
    return {
        templateUrl: 'sharedDirectives/fp-user-judgement-reasons-list/fp-user-judgement-reasons-list.template.html',
        bindToController: true,
        controller: 'FpUserJudgmentReasonsList as ctrl',
        scope: {
            predictionId: '='
        }
    };
}


FpUserJudgmentReasonsList.$inject = ['$state', 'JudgementService'];
function FpUserJudgmentReasonsList($state, JudgementService) {

    var _this = this;
    _this.saveComment = saveComment;
    _this.deleteComment = deleteComment;
    _this.onClickReasonAuthorImg = onClickReasonAuthorImg;

    JudgementService.getReasonsForPrediction(_this.predictionId)
    .then(function(judgementsWithReasons) {
        console.log(angular.copy(judgementsWithReasons));

        _this.judgementsWithReasons = judgementsWithReasons;

/*
        _this.judgementsWithReasons.push({
            'reasonText':'I\'m not sure but my friend thinks so',
            'likelihoodPercent':50,
            'comments': [
                {
                    'author': {
                        'fullName': 'Darragh McCarthy - Web developer'
                    },
                    'commentText': 'Some comment'
                },
                {
                    'author': {
                        'fullName': 'Darragh McCarthy - Web developer'
                    },
                    'commentText': 'ndustry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five cent'
                },
                {
                    'author': {
                        'fullName': 'Darragh McCarthy - Web developer'
                    },
                    'commentText': 'years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evi'
                },
                {
                    'author': {
                        'fullName': 'Darragh McCarthy - Web developer'
                    },
                    'commentText': 'ised words which dont look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isnt anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary '
                }
            ]
        });
        _this.judgementsWithReasons.push({
            'reasonText':'I dont think so. Theres no way',
            'likelihoodPercent':50,
            'comments': [
                {
                    'author': {
                        'fullName': 'Darragh McCarthy - Web developer'
                    },
                    'commentText': 'Some comment'
                },
                {
                    'author': {
                        'fullName': 'Darragh McCarthy - Web developer'
                    },
                    'commentText': 'ndustry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five cent'
                }
            ]
        });
        _this.judgementsWithReasons.push({
            'reasonText':'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries,',
            'likelihoodPercent':30,
            'comments': [
                {
                    'author': {
                        'fullName': 'Darragh McCarthy - Web developer'
                    },
                    'commentText': 'ndustry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five cent'
                }
            ]

        });
        _this.judgementsWithReasons.push({
            'reasonText':'but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
            'likelihoodPercent':80
        });
*/
    });

    function saveComment(judgement, commentText) {
        if (!commentText) {
            return;
        }

        JudgementService.saveNewReasonComment(judgement.id, commentText)
        .then(function onSaveCommentSuccess(newComment) {
            judgement.areCommentsVisible = true;
            judgement.comments.unshift(newComment);
        }, function onSaveCommentError() {
            console.error('failed to save new comment');
        });
    }
    function deleteComment(commentId) {
        JudgementService.deleteReasonComment()
        .then(function onDeleteCommentSuccess() {

        }, function onDeleteCommentError() {

        });
    }
    function onClickReasonAuthorImg(judgement) {
        if (!judgement.isAuthorNameVisible) {
            judgement.isAuthorNameVisible = true;
        } else {
            $state.go('app.user-profile', {
                userId: judgement.author.userId
            });
        }
    }

}

})();
