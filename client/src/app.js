var app = angular.module('thesisApp', ['ngRoute']);
app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/main.html',
            controller: 'mainController',
            controllerAs: 'mainCtrl'
        })
        .when('/:roomName', {
            templateUrl: 'views/room.html',
            controller: 'roomController',
            controllerAs: 'roomCtrl'
        });
    $locationProvider.html5Mode(true);
});

app.controller('mainController', function ($location) {
    var vm = this;
    vm.message = 'Testing';
    vm.setRoom = function () {
        //console.log(vm.roomName);
        $location.path("/" + vm.roomName);
    }
});

app.controller('roomController', function ($location,$routeParams) {
    var vm = this;
    var count = 1;
    vm.roomName = $routeParams.roomName;
    vm.link = $location.absUrl();
    var webrtc = new SimpleWebRTC({
        // the id/element dom element that will hold "our" video
        localVideoEl: 'localVideo',
        // the id/element dom element that will hold remote videos
        remoteVideosEl: '',
        // immediately ask for camera access
        autoRequestMedia: true,
        url: 'https://fxckyou.xyz:8888/',
        nick: 'user'
    });

    // a peer video has been added
    webrtc.on('videoAdded', function (video, peer) {
        
        console.log('video added', peer);
        var remotes = document.getElementById('remotes');
        if (remotes) {
            var container = document.createElement('div');
            container.className = 'videoContainer';
            container.id = 'container_' + webrtc.getDomId(peer);
            container.appendChild(video);
            var nickName = document.createElement('span');
            nickName.innerText = peer.nick + count;
            count++;
            container.appendChild(nickName);
            // suppress contextmenu
            video.oncontextmenu = function () { return false; };

            remotes.appendChild(container);
        }
    });

    // a peer video was removed
    webrtc.on('videoRemoved', function (video, peer) {
        console.log('video removed ', peer);
        var remotes = document.getElementById('remotes');
        var el = document.getElementById(peer ? 'container_' + webrtc.getDomId(peer) : 'localScreenContainer');
        if (remotes && el) {
            remotes.removeChild(el);
        }
    });


    webrtc.on('readyToCall', function () {
        // you can name it anything
        webrtc.joinRoom(vm.roomName);
    });

});

