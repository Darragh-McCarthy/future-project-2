$scope.$watch('user.password', function (newVal, oldVal) {
        if (!newVal) return;

        $scope.reqs = [];

        if (!isLongEnough(newVal)) {
            $scope.reqs.push('Too short');
        }

        if (!hasNumbers(newVal)) {
            $scope.reqs.push('Must include numbers');
        }

        $scope.showReqs = $scope.reqs.length;
    });

<input id="pwd"
                       type="password"
                       class="form-control"
                       placeholder="Password"
                       ng-model="user.password">



                       ng-change also works