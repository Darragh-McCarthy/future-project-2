(function() {
'use strict';

angular.module('myApp')
    .controller('FollowOffSite', FollowOffSite);

FollowOffSite.$inject = [];
function FollowOffSite() {

    var _this = this;
    _this.socialMediaProfiles = [
        {
            'type': 'Facebook',
            'url': '',
            'imgUrl': ''
        },
        {
            'type': 'Youtube',
            'url': '',
            'imgUrl': ''
        },
        {
            'type': 'Instagram',
            'url': '',
            'imgUrl': ''
        },
        {
            'type': 'Twitter',
            'url': '',
            'imgUrl': ''
        },
        {
            'type': 'Pinterest',
            'url': '',
            'imgUrl': ''
        }
    ];

}

})();
