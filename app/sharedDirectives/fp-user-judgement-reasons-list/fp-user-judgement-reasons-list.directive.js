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


FpUserJudgmentReasonsList.$inject = ['UserAuth', '$state', 'JudgementService'];
function FpUserJudgmentReasonsList(UserAuth, $state, JudgementService) {

    var _this = this;
    _this.saveComment = saveComment;
    _this.deleteComment = deleteComment;
    _this.onClickReasonAuthorImg = onClickReasonAuthorImg;

    JudgementService.getJudgementsForPrediction(_this.predictionId)
    .then(function(judgements) {
        _this.judgementsWithReasons = judgements.filter(function(judgement) {
            return !!judgement.reasonText;
        });
        _this.judgementsWithoutReasons = judgements.filter(function(judgement) {
            return !!!judgement.reasonText;
        });
    });

    function saveComment(judgement, commentText) {
        /*UserAuth.loginWithFacebook().then(
            function onSuccess(isNewLogin) {

                if (!commentText) {
                    return;
                }

                JudgementService.saveNewReasonComment(judgement.id, commentText)
                .then(function onSaveCommentSuccess(newComment) {*/
                    judgement.areCommentsVisible = true;
                    /*judgement.comments.unshift(newComment);
                }, function onSaveCommentError() {
                    console.error('failed to save new comment');
                });

                if (isNewLogin) {
                    $state.go($state.current, {}, {
                        reload:true
                    });
                }
            }
        );*/
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
