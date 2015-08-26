(function() {
'use strict';

angular.module('myApp')
    .factory('TopicService', TopicService);

TopicService.$inject = ['$q', 'Parse'];
function TopicService($q,  Parse) {

    var MIN_TOPIC_CHARACTER_LENGTH = {
        'val': 2,
        'makeErrorMsg': function() {
            return 'Topics must be at least ' +
                this.val +
                ' characters long';
        }
    };
    var MAX_TOPIC_CHARACTER_LENGTH = {
        'val': 100,
        'makeErrorMsg': function() {
            return 'Topics cannot be greater than ' +
                this.val +
                ' characters long';
        }
    };
    var FEATURED_TOPIC_TITLES = [
        'Technology',
        'Artificial intelligence',
        'Robotics',
        'Internet of things',
        'Human enhancement',
        'Gaming',
        'Biotechnology',
        'Nanotechnology',
        'Virtual reality',
        'Augmented reality',
        'Space travel',
        'Social networks',
        'Environment',
        'Synthetic biology',
        'Mobile devices',
        'Design',
        'Health',
        'Medicine',
        'Fashion',
        'Politics',
        'Sports',
        'Science',
        'Culture',
        'Economics',
        'Startups',
        'Business',
        'Education',
        'Entertainment'
    ];

    var NEW_PREDICTION_TOPIC_TITLE_SUGGESTIONS = [
        'Technology',
        'Design',
        'Health',
        'Medicine',
        'Fashion',
        'Politics',
        'Sports',
        'Science',
        'Culture',
        'Startups',
        'Business',
        'Education',
        'Entertainment'
    ];

    return {
        'validateNewTopicTitle': validateNewTopicTitle,
        'saveNewTopic': saveNewTopic,
        'getFeaturedTopicTitles': getFeaturedTopicTitles,
        'getNewPredictionTopicTitleSuggestions': getNewPredictionTopicTitleSuggestions
    };

    function saveNewTopic(topicTitle) {
        return Parse.Cloud.run('saveNewTopic', {
            'topicTitle': topicTitle
        });
    }

    function validateNewTopicTitle(topicTitle) {
        var errorMessages = [];
        if (topicTitle.length < MIN_TOPIC_CHARACTER_LENGTH.val) {
            errorMessages.push(MIN_TOPIC_CHARACTER_LENGTH.makeErrorMsg());
        }
        if (topicTitle.length > MAX_TOPIC_CHARACTER_LENGTH.val) {
            errorMessages.push(MAX_TOPIC_CHARACTER_LENGTH.makeErrorMsg());
        }
        return {
            'errors': errorMessages
        };
    }

    function getFeaturedTopicTitles() {
        return $q.when(FEATURED_TOPIC_TITLES);
    }

    function getNewPredictionTopicTitleSuggestions() {
        return $q.when(NEW_PREDICTION_TOPIC_TITLE_SUGGESTIONS);
    }
}

})();
