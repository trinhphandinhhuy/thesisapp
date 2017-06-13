lamkRTC.controller("mainController", function($scope, $location) {
    $scope.hostname = $location.absUrl();
    $scope.createRoom = function() {
        $location.path("/" + $scope.roomName);
    };
});
