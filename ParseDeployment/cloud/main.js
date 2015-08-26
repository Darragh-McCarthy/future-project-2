'use strict';

var JUDGEMENT_LIKELIHOOD_PERCENT_OPTIONS = [
    0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
];

var Mailgun = require('mailgun');
Mailgun.initialize('sandboxd5e0f918a26f489aaab13df5438f9db7.mailgun.org', 'key-e355f088775a5a0798bb7ec93b72b8c6');


var PrivateUserData = Parse.Object.extend('PrivateUserData');
var UserFeedback = Parse.Object.extend('UserFeedback');
var Judgement = Parse.Object.extend('Judgement');
var JudgementUpdate = Parse.Object.extend('JudgementUpdate');
var ReasonComment = Parse.Object.extend('ReasonComment');

var NOTIFICATION_TYPES = {
    'newCommentAddedToReason': 'newCommentAddedToReason',
    'newJudgementAddedToPrediction': 'newJudgementAddedToPrediction'
};

var Notification = Parse.Object.extend('Notification', {}, {
    newReasonCommentAdded: function(reasonComment, userToNotify) {
        return new Notification().save({
            'notificationType': NOTIFICATION_TYPES.newCommentAddedToReason,
            'reasonComment': reasonComment,
            'judgement': reasonComment.get('judgement'),
            'userToNotify': userToNotify
        })
        .then(null, function(e) {
            console.error(e);
        });
    },
    newJudgementAddedToPrediction: function(judgement, userToNotify) {
        return new Notification().save({
            'notificationType': NOTIFICATION_TYPES.newJudgementAddedToPrediction,
            'judgement': judgement,
            'userToNotify': userToNotify
        })
        .then(null, function(e) {
            console.error(e);
        });
    },
    getUnreadNotificationsForUser: function(user) {
        return new Parse.Query(Notification)
            .equalTo('userToNotify', user)
            .include('reasonComment')
            .include('judgement')
            .descending('createdAt')
            .descending('dateMarkedAsRead')
            .find()
            .then(function onSuccess(notifications) {
                if (notifications) {
                    return notifications;
                }
                return [];
            });
    },
    markNotificationAsRead: function(notificationId) {
        return new Parse.Query(Notification)
        .get(notificationId)
        .then(function onGetNotificationSuccess(notification) {
            return notification.save({
                'dateMarkedAsRead': new Date()
            });
        }, function onGetNotificationError(e) {
            console.error(e);
        });
    },
    castNotificationAsPlainObject: function(notification) {

        var parselessNotification = {
            'notificationType': notification.get('notificationType')
        };

        var reasonComment = notification.get('reasonComment');
        if (reasonComment) {
            var parselessComment = castReasonCommentAsPlainObject(reasonComment);
            parselessNotification.reasonComment = parselessComment;
        }

        var judgement = notification.get('notification');
        if (judgement) {
            var parselessJudgement = castJudgementAsPlainObject(judgement);
            parselessNotification.judgement = parselessJudgement;
        }

        return parselessNotification;
    }
});

var Prediction = Parse.Object.extend('Prediction', {}, {
    saveNew: function(author, predictionTitle) {

        var newPrediction = new Prediction({
            'author': author,
            'title': predictionTitle
        });

        var acl = new Parse.ACL();
        acl.setPublicReadAccess(true);
        newPrediction.setACL(acl);

        return newPrediction.save().then(function(savedPrediction) {
            author.addUnique('authoredPredictions', savedPrediction);
            return author.save().then(function() {
                return savedPrediction;
            });
        });
    }
});

var Topic = Parse.Object.extend('Topic', {}, {
    saveNew: function(author, topicTitle) {

        return new Parse.Query(Topic)
            .equalTo('title', topicTitle)
            .first()
            .then(function(topic) {

                if (topic) {
                    return topic;
                }

                return new Topic({
                    'title': topicTitle,
                    'author': author
                })
                .save(null, function(e) {
                    console.error(e);
                });
            })
        ;
    }
});

Parse.Cloud.define('getUnreadNotifications', function(request, response) {

    if (!request.user) {
        return response.error('request.user required');
    }

    return Notification.getUnreadNotificationsForUser(request.user)
    .then(function(notifications) {
        var parselessNotifications = notifications.map(function(notification) {
            return Notification.castNotificationAsPlainObject(notification);
        });
        response.success(parselessNotifications);
    }, function onError(e) {
        console.error(e);
        response.error('error getting unread notifications');
    });
});

Parse.Cloud.define('saveNewReasonComment', function(request, response) {

    if (!request.user) {
        return response.error('request.user required');
    }
    if (!request.params.judgementWithReasonId) {
        return response.error('request.judgementWithReasonId required');
    }
    if (!request.params.commentText) {
        return response.error('request.commentText required');
    }

    var promiseJudgement = new Parse.Query(Judgement)
        .get(request.params.judgementWithReasonId)
        .then(null, function(e) {
            console.error(e);
            response.error('Error retrieving judgement');
        });

    var promiseSaveComment = promiseJudgement
    .then(function(judgement) {

        var reasonComment = new ReasonComment({
            'author': request.user,
            'commentText': request.params.commentText,
            'judgement': judgement,
            'prediction': judgement.get('prediction')
        });

        var acl = new Parse.ACL();
        acl.setPublicReadAccess(true);
        reasonComment.setACL(acl);

        return reasonComment.save().then(null, function(e) {
            console.error(e);
            response.error('Error saving reason comment');
        });
    });

    return promiseJudgement.then(function(judgement) {
        return promiseSaveComment.then(function(comment) {
            var userToNotify = judgement.get('author');
            return Notification.newReasonCommentAdded(comment, userToNotify)
            .then(
                callResponseSuccess.bind(),
                callResponseSuccess.bind()
            );
            function callResponseSuccess() {
                response.success(
                    castReasonCommentAsPlainObject(comment)
                );
            }
        }, function(e) {
            console.error(e);
            response.error('Error casting comment as plain object');
        });
    });
});

/*
Parse.Cloud.define('deleteReasonComment', function(request, response) {

    if (!request.user) {
        return response.error('request.user required');
    }
    if (!request.params.reasonCommentId) {
        return response.error('request.params.reasonCommentId required');
    }

    var promiseReasonComment = new Parse.Query(ReasonComment)
    .get(request.params.reasonCommentId)
    .then(function(reasonComment) {
        if (request.user.id !== reasonComment.get('author').id) {
            response.error(
                'not authorised to delete this comment.' +
                'user.id:' + request.user.id
            );
            var promise = new Parse.Promise();
            var rejectedPromise = promise.reject();
            return rejectedPromise;
        }
        return reasonComment;
    }, function(e) {
        response.error('error retrieving reason comment');
    });

    return promiseReasonComment.then(function(reasonComment) {
        reasonComment.set('deleted', true);
        var acl = new Parse.ACL();
        reasonComment.setACL(acl);
        return reasonComment.save({
            useMasterKey: true
        }).then(
            response.error.bind(),
            function(e) {
                console.error(e);
                response.error('error updating comment');
            }
        );
    });
});
*/

Parse.Cloud.define('saveUserFeedback', function(request, response) {

    if (!request.params.feedbackText) {
        return response.error('feedbackText required');
    }
/*
    if (!request.params.email) {
        return response.error('email required');
    }
*/
    

    var promiseEmail = new Parse.Query(PrivateUserData)
    .equalTo('user', request.user)
    .first({
        useMasterKey:true
    })
    .then(function(PrivateUserData) {
        if (PrivateUserData) {
            return PrivateUserData.get('email');
        }
        return null;
    }, function onError(e) {
        console.log(e);
        response.error('Error retrieving email');
    });
    return promiseEmail.then(function(email) {
        var from = request.params.email || email || 'could\'t find user email';

        return Mailgun.sendEmail({
            'from': 'FutureProject <mailgun@sandboxd5e0f918a26f489aaab13df5438f9db7.mailgun.org>',
            'to': 'darraghjames@gmail.com',
            'subject': 'Feedback',
            'text': from + ': ' + request.params.feedbackText
        })
        .then(function onSuccess() {
            response.success();
        }, function onError(e) {
            console.error('Failed to send email. Response:');
            console.error(e);
            return new UserFeedback().save({
                'author': request.user,
                'email': from,
                'feedbackText': request.params.feedbackText
            }).then(
                response.success.bind(),
                function onError(e) {
                    console.error(e);
                    response.error('Failed to send email and failed to store feedback');
                }
            );
        });
    });
});

Parse.Cloud.define('getUserById', function(request, response) {

    if (!request.params.userId) {
        return response.error('userId required');
    }

    return new Parse.Query(Parse.User).get(request.params.userId)
    .then(function(user) {
        response.success(
            castUserAsPlainObject(user)
        );
    }, function() {
        response.error('error retrieving user');
    });
});

Parse.Cloud.define('saveNewPrediction', function(request, response) {

    if (!request.user) {
        return response.error('request.user required');
    }
    if (!request.params.predictionTitle) {
        return response.error('predictionTitle required');
    }
    return Prediction.saveNew(request.user, request.params.predictionTitle).then(
        function(newlySavedPrediction) {
            response.success(
                castPredictionAsPlainObject(newlySavedPrediction)
            );
        },
        response.error.bind('Parse error while saving prediction')
    );
});

Parse.Cloud.define('saveNewPredictionWithTopicTitle', function(request, response) {

    if (!request.user) {
        return response.error('request.user required');
    }
    if (!request.params.predictionTitle) {
        return response.error('predictionTitle required');
    }
    if (!request.params.topicTitle) {
        return response.error('topicTitle required');
    }

    var promisePrediction = Prediction.saveNew(request.user, request.params.predictionTitle)
    .then(null, response.error.bind());

    var promiseTopic = Topic.saveNew(request.user, request.params.topicTitle)
    .then(null, response.error.bind());

    var promiseAddTopicToPrediction = promisePrediction
    .then(function(prediction) {
        return promiseTopic.then(function(topic) {

            prediction.addUnique('topics', topic);

            return prediction.save(null, {useMasterKey: true}).then(null,
                function onError() {
                    response.error('error adding topic to prediction topics');
                }
            );
        });
    });

    var promiseIncrementTopicPredictionsCount = promiseAddTopicToPrediction
    .then(function(updatedPrediction) {
        return promiseTopic.then(function(topic) {
            topic.addUnique('predictionCountAsPredictionIDs', updatedPrediction.id);
            return topic.save().then(function() {
                    response.success(
                        castPredictionAsPlainObject(updatedPrediction)
                    );
                },
                function onError(e) {
                    console.error(e);
                    response.error('error updating topic predictions count');
                }
            );
        });
    });

    return promiseIncrementTopicPredictionsCount;
});

Parse.Cloud.define('deletePrediction', function(request, response) {

    if (!request.user) {
        return response.error('request.user required');
    }
    if (!request.params.predictionId) {
        return response.error('predictionId required');
    }

    var promisePrediction =
    new Parse.Query(Prediction)
    .get(request.params.predictionId)
    .then(null, function onError(errorMsg) {
            console.error(errorMsg);
            response.error('Invalid "predictionId"');
        }
    );

    return promisePrediction.then(function(prediction) {

        if (request.user.id !== prediction.get('author').id) {
            return response.error('Unauthorised delete attempt by ' + request.user.id);
        }

        var acl = new Parse.ACL();
        prediction.setACL(acl);
        prediction.set('deleted', new Date());

        return prediction.save(null, {
            useMasterKey: true
        }).then(function() {
                var topics = prediction.get('topics');
                if (topics) {
                    topics.forEach(function(topic) {
                        topic.remove('predictionCountAsPredictionIDs', prediction.id);
                    });
                    return Parse.Object.saveAll(topics).then(
                        response.success.bind(),
                        response.success.bind()
                    );
                }
                response.success();
            },
            function onSaveError(e) {
                console.error(e);
                response.error('error saving prediction');
            }
        );
    });
});

Parse.Cloud.define('getReasonsForPrediction', function(request, response) {

    if (!request.params.predictionId) {
        return response.error('predictionId required');
    }

    var promisePrediction = new Parse.Query(Prediction)
    .get(request.params.predictionId).then(null, function(e) {
            console.error(e);
            response.error('Parse error retrieving prediction');
        }
    );

    var promiseJudgements = promisePrediction.then(
        function(prediction) {
            return new Parse.Query(Judgement)
                .equalTo('prediction', prediction)
                .exists('reasonText')
                .include('author')
                .find()
                .then(function(judgements) {
                    if (!judgements) {
                        return [];
                    }
                    return judgements;
                }, function(e) {
                    console.error(e);
                    response.error('error retrieving judgements');
                });
        }
    );

    var promiseComments = promisePrediction.then(
        function(prediction) {
            return new Parse.Query(ReasonComment)
                .equalTo('prediction', prediction)
                .doesNotExist('deleted')
                .include('author')
                .descending('createdAt')
                .find()
                .then(function(comments) {
                    if (!comments) {
                        return [];
                    }
                    return comments;
                }, function(e) {
                    console.error(e);
                    response.error('error retrieving comments');
                });
        }
    );

    return promiseJudgements.then(function(judgements) {
        return promiseComments.then(function(comments) {

            var parselessComments = castReasonCommentsAsPlainObjects(comments);
            var parselessJudgements = castJudgementsAsPlainObjects(judgements);

            parselessJudgements.forEach(function(parselessJudgement) {
                parselessJudgement.comments = [];
                parselessComments.forEach(function(comment) {
                    if (parselessJudgement.id === comment.judgementId) {
                        parselessJudgement.comments.push(comment);
                    }
                });
            });
            response.success(parselessJudgements);
        });
    });
});

Parse.Cloud.define('addTopicByTitleToPrediction', function(request, response) {

    var errorMsg;
    if (!request.user) {
        return response.error('request.user required');
    }
    if (!request.params.predictionId) {
        errorMsg = 'predictionId required';
        console.error('errorMsg');
        response.error('errorMsg');
        return;
    }
    if (!request.params.topicTitle) {
        errorMsg = 'topicTitle required';
        console.error(errorMsg);
        response.error(errorMsg);
        return;
    }

    var promiseTopic = new Parse.Query(Topic)
    .equalTo('title', request.params.topicTitle)
    .first()
    .then(function(topic) {
            if (topic) {
                return topic;
            }
            return new Topic({
                'title': request.params.topicTitle
            }).save();
        },
        function onError(errorMsg) {
            console.error(errorMsg);
            response.error('Parse error retrieving topic');
        }
    );

    var predictionQuery = new Parse.Query(Prediction);
    var promisePrediction = predictionQuery.get(request.params.predictionId)
    .then(null, function onError(errorMsg) {
        console.error(errorMsg);
        response.error('Parse error retrieving prediction');
    });

    var promiseSavePrediction = promiseTopic.then(function(topic) {
        return promisePrediction.then(function(prediction) {
            return prediction
            .addUnique('topics', topic)
            .save(null, {
                useMasterKey: true
            }).then(null, function onError(e) {
                console.error(e);
                response.error('Parse error saving prediction');
            });
        });
    });

    return promiseTopic.then(function(topic) {
        return promiseSavePrediction.then(function(prediction) {
            topic.addUnique('predictionsCount', prediction.id);
            return topic.save().then(
                function onSuccess() {
                    response.success(
                        castTopicAsPlainObject(topic)
                    );
                },
                function onError(e) {
                    console.error(e);
                    response.error('error updating topic predictionsCount');
                }

            );
        });
    });
});

Parse.Cloud.define('removeTopicFromPrediction', function(request, response) {

    if (!request.user) {
        return response.error('request.user required');
    }
    if (!request.params.predictionId) {
        return response.error('predictionId required');
    }
    if (!request.params.topicId) {
        return response.error('topicId required');
    }

    var predictionQuery = new Parse.Query(Prediction);
    var promisePrediction = predictionQuery.get(request.params.predictionId)
    .then(
        function onGetSuccess(prediction) {
            return prediction;
        },
        function onGetError(errorMsg) {
            console.error(errorMsg);
            response.error('Parse error retrieving prediction');
        }
    );

    return promisePrediction.then(function(prediction) {

        var topicToRemove = new Topic({
            'id': request.params.topicId
        });

        prediction.remove('topics', topicToRemove);

        return prediction.save(null, {
            useMasterKey: true
        }).then(
            function(savedPrediction) {
                response.success(
                    castPredictionAsPlainObject(savedPrediction)
                );
            },
            function(e) {
                console.error(e);
                response.error('Parse error saving prediction');
            }
        );
    });
});

Parse.Cloud.define('getRecentPredictions', function(request, response) {

    if (!request.params.numPredictions) {
        return response.error('numPredictions required');
    }
    if (!(request.params.numPredictionsToSkip ||
        request.params.numPredictionsToSkip >= 0)) {
        return response.error('numPredictionsToSkip required');
    }

    return new Parse.Query(Prediction)
        .include('topics')
        .skip(request.params.numPredictionsToSkip)
        .limit(request.params.numPredictions)
        .descending('createdAt')
        .find()
        .then(function(predictions) {
                response.success(
                    castPredictionsAsPlainObjects(
                        predictions || []
                    )
                );
            },
            function(e) {
                console.error(e);
                response.error('Parse error finding predictions');
            }
        );
});

Parse.Cloud.define('getPredictionById', function(request, response) {

    if (!request.params.predictionId) {
        return response.error('predictionId required');
    }

    return new Parse.Query(Prediction)
    .include('topics')
    .get(request.params.predictionId)
    .then(function onSuccess(prediction) {
            response.success(
                castPredictionAsPlainObject(prediction)
            );
        },
        function onError(e) {
            console.error(e);
            response.error('error retrieving prediction');
        }
    );
});

Parse.Cloud.define('getAuthorOfPredictionById', function(request, response) {

    if (!request.params.predictionId) {
        return response.error('predictionId required');
    }

    return new Parse.Query(Prediction)
    .get(request.params.predictionId)
    .then(function(prediction) {
        return prediction.get('author').fetch()
        .then(function(author) {
            response.success(
                castUserAsPlainObject(author)
            );
        }, function(e) {
            response.error('error retrieving author');
        });
    }, function(e) {
        console.error(e);
        response.error('error retrieving prediction');
    });
});

Parse.Cloud.define('getPredictionsByAuthorId', function(request, response) {

    if (!request.params.authorId) {
        return response.error('authorId required');
    }

    var authorQuery = new Parse.Query(Parse.User)
    .get(request.params.authorId).then(null, function() {
        response.error('error retrieving author');
    });

    return authorQuery.then(function(author) {
        return new Parse.Query(Prediction)
            .equalTo('author', author)
            .include('topics')
            .descending('createdAt')
            .find().then(
            function onSuccess(predictions) {
                response.success(
                    castPredictionsAsPlainObjects(predictions || [])
                );
            },
            function onError(e) {
                console.error(e);
                response.error('Parse error retrieving predictions');
            }
        );
    });
});

//Parse.Cloud.define('getJudgementsForPrediction', function(request, response) {});

Parse.Cloud.define('updateFacebookDataCopy', function(request, response) {

    if (!request.user) {
        return response.error('request.user required');
    }
    if (!request.params.basicFacebookData) {
        return response.error('basicFacebookData required');
    }

    var promisePrivateFacebookData = new Parse.Query(PrivateUserData)
        .equalTo('user', request.user)
        .equalTo('email', request.params.basicFacebookData.email)
        .equalTo('gender', request.params.basicFacebookData.gender)
        .descending('createdAt')
        .first()
        .then(null, function onError(e) {
                console.error(e);
                response.error('Parse error retrieving user data');
            }
        )
    ;
    return promisePrivateFacebookData.then(function(mostRecentPrivateData) {

        if (mostRecentPrivateData) {
            response.success();
        }

        var newPrivateUserData = new PrivateUserData({
            'user': request.user,
            'email': request.params.basicFacebookData.email,
            'gender': request.params.basicFacebookData.gender
        });

        var acl = new Parse.ACL();
        newPrivateUserData.setACL(acl);

        return newPrivateUserData.save().then(
            function onSuccess() {
                response.success();
            },
            function onError(e) {
                console.error(e);
                response.error('Parse error saving user data');
            }
        );
    });
});

Parse.Cloud.define('saveNewTopic', function(request, response) {

    if (!request.user) {
        return response.error('request.user required');
    }
    if (!request.params.topicTitle) {
        return response.error('topicTitle required');
    }

    return Topic.saveNew(request.user, request.params.topicTitle)
    .then(
        function(savedTopic) {
            response.success(castTopicAsPlainObject(savedTopic));
        },
        response.error.bind()
    );
});

Parse.Cloud.define('getPredictionsByTopicTitle', function(request, response) {

    if (!request.params.topicTitle) {
        return response.error('topicTitle required');
    }

    var topicQuery = new Parse.Query(Topic);
    topicQuery.equalTo('title', request.params.topicTitle);
    var promiseTopic = topicQuery.first()
    .then(function onSuccess(topic) {
        if (!topic) {
            response.success([]);
            var promise = new Parse.Promise();
            var rejectedPromise = promise.reject();
            return rejectedPromise;
        }
        return topic;
    }, function onError(e) {
        response.error(e);
    });

    return promiseTopic.then(function(topic) {
        return new Parse.Query(Prediction)
        .include('topics')
        .equalTo('topics', topic)
        .find()
        .then(function onSuccess(predictions) {
                response.success(
                    castPredictionsAsPlainObjects(predictions || [])
                );
            },
            function onError(e) {
                console.error(e);
                response.error('Parse error finding predictions');
            }
        );
    });
});

Parse.Cloud.define('setJudgementLikelihoodPercent', function(request, response) {

    if (!request.user) {
        return response.error('request.user required');
    }
    if (!request.params.predictionId) {
        return response.error('predictionId required');
    }
    if (JUDGEMENT_LIKELIHOOD_PERCENT_OPTIONS.indexOf(request.params.likelihoodPercent) === -1) {
        return response.error('likelihoodPercent required: ' +
            JUDGEMENT_LIKELIHOOD_PERCENT_OPTIONS.join(', '));
    }

    var promiseFindFirstJudgement = new Parse.Query(Judgement)
    .equalTo('author', request.user)
    .equalTo('prediction', new Prediction({
        'id': request.params.predictionId
    }))
    .first({
        useMasterKey: true
    })
    .then(null, function onError(e) {
        console.error(e);
        response.error('judgement lookup error');
    });

    var promiseJudgement = promiseFindFirstJudgement
    .then(function(judgement) {
        if (judgement) {
            return {
                'judgement': judgement,
                'isNewJudgement': false,
                'previousLikelihoodPercent': judgement.get('likelihoodPercent')
            };
        }

        var promisePrediction = new Parse.Query(Prediction)
            .get(request.params.predictionId)
            .then(function(prediction) {
                if (!prediction) {
                    response.error('prediction does not exist');
                    var promise = new Parse.Promise();
                    var rejectedPromise = promise.reject();
                    return rejectedPromise;
                }
                return prediction;
            }, function onError(e) {
                console.error(e);
                response.error('prediction lookup error');
            });

        return promisePrediction.then(function(prediction) {
            return new Judgement({
                'prediction': prediction,
                'author': request.user,
                'likelihoodPercent': request.params.likelihoodPercent
            })
            .save().then(
                function onSuccess(newJudgement) {
                return {
                    'judgement': newJudgement,
                    'isNewJudgement': true
                };
            }, function onError(e) {
                console.error(e);
                response.error('error saving new judgement');
            });
        });
    });

    var promiseUpdateJudgement = promiseJudgement
    .then(function(promiseJudgementObject) {
        if (promiseJudgementObject.isNewJudgement) {
            return {
                'judgement': promiseJudgementObject.judgement,
                'previousLikelihoodPercent': promiseJudgementObject.previousLikelihoodPercent
            };
        }
        if (request.user.id !== promiseJudgementObject.judgement.get('author').id) {
            var errorMsg = 'Unauthorised update. User:' + request.user.id;
            console.error(errorMsg);
            response.error(errorMsg);
            var promise = new Parse.Promise();
            var rejectedPromise = promise.reject();
            return rejectedPromise;
        }

        if (promiseJudgementObject.judgement.get('deleted')) {
            promiseJudgementObject.judgement =
                setJudgementAttributesToNotDeletedState(promiseJudgementObject.judgement);
        }
        return promiseJudgementObject.judgement.save(
            {'likelihoodPercent': request.params.likelihoodPercent},
            {useMasterKey: true}
        )
        .then(function(updatedJudgement) {
            return {
                'judgement': updatedJudgement,
                'previousLikelihoodPercent': promiseJudgementObject.previousLikelihoodPercent
            };
        }, function onError(e) {
            console.error(e);
            response.error('error updating judgement');
        });
    });

    var promiseLogJudgementUpdate = promiseUpdateJudgement
    .then(function(updatedJudgementObject) {
        var judgementUpdate = new JudgementUpdate({
            'judgement': updatedJudgementObject.judgement,
            'author': request.user,
            'prediction': updatedJudgementObject.judgement.get('prediction'),
            'likelihoodPercent': updatedJudgementObject.judgement.get('likelihoodPercent')
        });

        var acl = new Parse.ACL();
        judgementUpdate.setACL(acl);

        return judgementUpdate.save().then(
            function onSuccess() {
            return updatedJudgementObject;
        }, function onError(e) {
            console.error(e);
            response.error('error logging update to judgement');
        });
    });

    var promiseUpdatePercentCounters = promiseLogJudgementUpdate
    .then(function(updatedJudgementObject) {

        var prediction = updatedJudgementObject.judgement.get('prediction');

        prediction.addUnique(
            makeLikelihoodPercentCountPropName(request.params.likelihoodPercent),
            request.user.id
        );

        if (request.params.likelihoodPercent !== updatedJudgementObject.previousLikelihoodPercent) {
            if (updatedJudgementObject.previousLikelihoodPercent) {
                prediction.remove(
                    makeLikelihoodPercentCountPropName(
                        updatedJudgementObject.previousLikelihoodPercent
                    ),
                    request.user.id
                );
            }
        }

        return prediction.save(null, {useMasterKey: true})
        .then(function onSuccess() {
            response.success(
                castJudgementAsPlainObject(updatedJudgementObject.judgement)
            );
        }, function onError(errorMsg) {
            response.error('Parse error incrementing percent count');
            console.error(errorMsg);
        });
    });
});

Parse.Cloud.define('deleteJudgementLikelihoodPercent', function(request, response) {

    if (!request.user) {
        return response.error('request.user required');
    }
    if (!request.params.predictionId) {
        return response.error('predictionId required');
    }

    var promiseJudgement =
        new Parse.Query(Judgement)
        .doesNotExist('deleted')
        .equalTo('author', request.user)
        .equalTo('prediction', new Prediction({
            'id': request.params.predictionId
        }))
        .first(function(judgement) {
            if (!judgement) {
                var promise = new Parse.Promise();
                var rejectedPromise = promise.reject();
                return rejectedPromise;
            }
            return judgement;
        }, function onError(e) {
            console.error(e);
            response.error('Parse error retrieving most recent judgement');
        });

    return promiseJudgement.then(function(judgement) {

        var prediction = judgement.get('prediction');

        prediction.remove(
            makeLikelihoodPercentCountPropName(judgement.get('likelihoodPercent')),
            request.user.id
        );

        judgement = setJudgementAttributesToDeletedState(judgement);

        return Parse.Object.saveAll([prediction, judgement], {
            useMasterKey:true
        })
        .then(
            function onSaveAllSuccess() {
                return response.success();
            },
            function onSaveAllError(errorMsg) {
                console.error(errorMsg);
                response.error(
                    'Parse error saving judgement and prediction'
                );
            }
        );
    });
});

Parse.Cloud.define('setJudgementReason', function(request, response) {

    if (!request.user) {
        return response.error('request.user required');
    }
    if (!request.params.judgementId) {
        return response.error('judgementId required');
    }
    if (!request.params.reasonText && request.params.reasonText !== '') {
        return response.error('reasonText required');
    }

    var promiseJudgement = new Parse.Query(Judgement)
    .get(request.params.judgementId)
    .then(null, function(e) {
        console.error(e);
        response.error('Invalid "judgementId"');
    });

    var promiseUpdateJudgement = promiseJudgement
    .then(function(currentJudgement) {
        if (request.params.reasonText === '') {
            currentJudgement.unset('reasonText');
        } else {
            currentJudgement.set('reasonText', request.params.reasonText);
        }
        return currentJudgement.save(null, {
            useMasterKey:true
        }).then(null, function onSaveError(errorMsg) {
                console.error(errorMsg);
                response.error('Parse error saving Judgement');
            }
        );
    });

    var promiseLogJudgementUpdate = promiseUpdateJudgement
    .then(function(updatedJudgement) {
        var judgementUpdate = new JudgementUpdate({
            'judgement': updatedJudgement,
            'author': request.user,
            'prediction': updatedJudgement.get('prediction'),
            'reasonText': updatedJudgement.get('reasonText')
        });

        var acl = new Parse.ACL();
        judgementUpdate.setACL(acl);

        return judgementUpdate.save().then(
            function onSaveSuccess() {
                return updatedJudgement;
            }, function onError(e) {
            console.error(e);
            response.error('error logging update to judgement');
        });
    });

    return promiseLogJudgementUpdate
    .then(function(updatedJudgement) {
        var prediction = updatedJudgement.get('prediction');
        if (updatedJudgement.get('reasonText')) {
            prediction.addUnique('reasonsCountAsUserIDs', request.user.id);
        } else {
            prediction.remove('reasonsCountAsUserIDs', request.user.id);
        }
        return prediction.save(null, {
            useMasterKey: true
        }).then(
            function onSuccess() {
                response.success(
                    castJudgementAsPlainObject(updatedJudgement)
                );
            },
            function onError(e) {
                response.error('error updating reasons count')
            }
        );
    });
});

Parse.Cloud.define('getAllJudgementsForCurrentUser', function(request, response) {

    if (!request.user) {
        return response.error('request.user required');
    }

    return new Parse.Query(Judgement)
    .doesNotExist('deleted')
    .equalTo('author', request.user)
    .find()
    .then(
        function(judgements) {
            response.success(
                castJudgementsAsPlainObjects(judgements)
            );
        },
        function(e) {
            console.error(e);
            response.error('Parse error retrieving judgements');
        }
    );
});

function makeLikelihoodPercentCountPropName(likelihoodPercent) {
    return 'judgement' + likelihoodPercent + 'PercentCountAsUserIDs';
}

function setJudgementAttributesToDeletedState(judgement) {
    var acl = new Parse.ACL();
    judgement.setACL(acl);
    judgement.set('deleted', new Date());
    return judgement;
}

function setJudgementAttributesToNotDeletedState(judgement) {
    var acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    judgement.setACL(acl);
    judgement.unset('deleted');
    return judgement;
}

function castPredictionsAsPlainObjects(predictions) {
    return predictions.map(function(prediction) {
        return castPredictionAsPlainObject(prediction);
    });
}

function castPredictionAsPlainObject(prediction) {

    var topics = castTopicsAsPlainObjects(
        prediction.get('topics') || []
    );
    var author = castUserAsPlainObject(
        prediction.get('author')
    );
    var reasonsCount = 0;
    if (prediction.get('reasonsCountAsUserIDs')) {
        reasonsCount = prediction.get('reasonsCountAsUserIDs').length;
    }

    return {
        'id': prediction.id,
        'title': prediction.get('title'),
        'topics': topics,
        'author': author,
        'createdAt': prediction.createdAt,
        'reasonsCount': reasonsCount
    };
}

function castTopicsAsPlainObjects(topics) {
    return topics.map(function(topic) {
        return castTopicAsPlainObject(topic);
    });
}

function castTopicAsPlainObject(topic) {
    return {
        'id': topic.id,
        'title': topic.get('title')
    };
}

function castUserAsPlainObject(user) {
    return {
        'userId': user.id,
        'publicFacebookData': user.get('publicFacebookData')
    };
}

function castJudgementsAsPlainObjects(judgements) {
    return judgements.map(function(judgement) {
        return castJudgementAsPlainObject(judgement);
    });
}

function castJudgementAsPlainObject(judgement) {
    var parselessJudgement = {
        'id': judgement.id,
        'updatedAt': judgement.updatedAt,
        'authorId': judgement.get('author').id,
        'predictionId': judgement.get('prediction').id,
        'likelihoodPercent': judgement.get('likelihoodPercent')
    };

    if (judgement.get('reasonText')) {
        parselessJudgement.reasonText = judgement.get('reasonText');
    }
    if (judgement.get('author')) {
        parselessJudgement.author =
            castUserAsPlainObject(judgement.get('author'));
    }
    return parselessJudgement;
}

function castReasonCommentsAsPlainObjects(comments) {
    return comments
    .map(function(comment) {
        return castReasonCommentAsPlainObject(comment);
    })
    .filter(function(comment) {
        return !!comment;
    });
}

function castReasonCommentAsPlainObject(comment) {
    return {
        'author': castUserAsPlainObject(comment.get('author')),
        'commentText': comment.get('commentText'),
        'predictionId': comment.get('prediction').id,
        'judgementId': comment.get('judgement').id,
    };
}

