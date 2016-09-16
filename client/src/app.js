var lamkRTC = angular.module("LamkRTC", ["ngRoute", "ngClickCopy"]);
//var lockStat = false;

lamkRTC.config(function ($routeProvider, $locationProvider) {
	$routeProvider
		.when('/', {
			templateUrl : 'views/home.html',
			controller  : 'mainController'
		})
		.when('/:roomName', {
			templateUrl : 'views/room.html',
			controller  : 'roomController'
		});
	$locationProvider.html5Mode(true);
});
