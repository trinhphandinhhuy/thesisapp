'use strict';

//var lockStat = false;
lamkRTC.config(function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        templateUrl: 'app/components/home/view.html',
        controller: 'mainController'
    }).when('/:roomName', {
        templateUrl: 'app/components/room/view.html',
        controller: 'roomController'
    });
    $locationProvider.html5Mode(true);
});
