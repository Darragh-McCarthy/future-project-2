(function() {
'use strict';

angular.module('myApp')
    .controller('Footer', Footer);

Footer.$inject = ['$stateParams'];
function Footer($stateParams) {
    //var _this = this;
    //_this.topicTitleToHide = $stateParams.topic || 'Everything';
}

})();

