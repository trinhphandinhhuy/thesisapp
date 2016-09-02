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
    //$locationProvider.html5Mode(true);
});

app.controller('mainController', function ($location) {
    var vm = this;
    vm.hostname = $location.host() + "/";
    vm.createRoom = function () {
        $location.path("/" + vm.roomName);
    }
});

app.controller('roomController', function ($location, $routeParams) {
    var vm = this;
    vm.roomName = $routeParams.roomName;
    vm.link = $location.absUrl();
    var webrtc = new SimpleWebRTC({
        // the id/element dom element that will hold "our" video
        localVideoEl: 'localVideo',
        // the id/element dom element that will hold remote videos
        remoteVideosEl: '',
        // immediately ask for camera access
        autoRequestMedia: true,
        // signaling server
        url: 'https://fxckyou.xyz:8888/',
        detectSpeakingEvents: true,
        autoAdjustMic: false
    });

    // we got access to the camera
    webrtc.on('localStream', function (stream) {
        //console.log(stream.getVideoTracks()[0]);
        var video = stream.getVideoTracks()[0];
        $("button[name='video']").click(function () {
            video.enabled = !video.enabled;
            $("button[name='video'] i").toggleClass("fa-video-camera").toggleClass("fa-pause")
        });
        //console.log(stream.getAudioTracks()[0]);
        var audio = stream.getAudioTracks()[0];
        $("button[name='audio']").click(function () {
            audio.enabled = !audio.enabled;
            $("button[name='audio'] i").toggleClass("fa-microphone").toggleClass("fa-microphone-slash")
        });
    });

    // local screen obtained
    webrtc.on('localScreenAdded', function (video) {
        video.onclick = function () {
            video.style.width = video.videoWidth + 'px';
            video.style.height = video.videoHeight + 'px';
        };
        document.getElementById('localScreenContainer').appendChild(video);
        $('#localScreenContainer').show();
    });

    // local screen removed
    webrtc.on('localScreenRemoved', function (video) {
        document.getElementById('localScreenContainer').removeChild(video);
        $('#localScreenContainer').hide();
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
        if (vm.roomName) {
            webrtc.joinRoom(vm.roomName);
        }

    });

    //Send chat
    vm.sendMessage = function () {
        var id = $(".mes.active").attr("id");
        console.log();
        webrtc.sendDirectlyToAll(vm.roomName, 'chat', vm.message);
        if (id != "me") {
            $(".mes.active").removeClass("active");
            $('#conversation').append("<div id='me' class='mes me active'>" +
                "<p class='from'>Me</p>" +
                "<p class='content'></p>" +
                "</div>");
        }
        $(".mes.active .content").append(vm.message + "<br>");
        vm.message = "";
    };

    //Set Nickname
    vm.nick = "Input your username";
    vm.editing = false;
    vm.setNick = function () {
        webrtc.sendDirectlyToAll(vm.roomName, 'nick', vm.nick);
    };
    vm.editItem = function () {
        vm.editing = true;
    };
    vm.doneEditing = function () {
        vm.editing = false;
        if (vm.nick != "Input your username" && vm.nick != "") {
            webrtc.sendDirectlyToAll(vm.roomName, 'nick', vm.nick);
        } else if (vm.nick == "") {
            vm.nick = "Input your username";
        }
    };
    webrtc.on('channelMessage', function (peer, label, data) {
        if (data.type === 'chat') {
            var id = peer.id;
            var activeID = $(".mes.active").attr("id");
            var from = typeof peer.nick == "undefined" ? id : peer.nick;
            if (activeID != id) {
                $(".mes.active").removeClass("active");
                $('#conversation').append("<div id='" + id + "' class='mes other active'>" +
                    "<p class='from'>" + from + "</p>" +
                    "<p class='content'>" + data.payload + "</p>" +
                    "</div>");
            }
            $(".mes.active .content").append(data.payload + "<br>");
        } else if (data.type === 'nick') {
            peer.nick = data.payload;
        }
    });

    //Leave room
	vm.leave = function () {
    	webrtc.stopLocalVideo();
		webrtc.leaveRoom();
		webrtc.disconnect();
		$location.path('/');
	};

    //filetransfer
	var peers = [];
	webrtc.on('createdPeer', function (peer) {
		console.log('createdPeer', peer);
		var remotes = document.getElementById('remotes');
		console.log(peer);
		peers.push(peer);
		console.log(peers);
		if (!remotes) return;
		if (peer && peer.pc) {
			peer.pc.on('iceConnectionStateChange', function (event) {
				var state = peer.pc.iceConnectionState;
				//console.log('state', state);
				switch (state) {
					case 'checking':
						break;
					case 'connected':
						break;
					case 'completed': // on caller side
						break;
					case 'disconnected':
						break;
					case 'failed':
						break;
					case 'closed':
						var index = peers.indexOf(peer);
						if (index > -1) {
							peers.splice(index, 1);
						}
						console.log(peers);
						break;
				}
			});
		}
		// receiving an incoming filetransfer
		peer.on('fileTransfer', function (metadata, receiver) {
			console.log('incoming filetransfer', metadata);
			// get notified when file is done
			receiver.on('receivedFile', function (file, metadata) {
				console.log('received file', metadata.name, metadata.size);
				$("#conversation").append("<p class='file'>You just received a file named '" + metadata.name + "'</p><a href='" + URL.createObjectURL(file) + "' download='" + metadata.name + "'>Download</a>");
				// close the channel
				receiver.channel.close();
			});
			$(".mes.active").removeClass("active");
			//filelist.appendChild(item);
		});
	});
	var fileToAll = document.getElementById("fileToAll");
	fileToAll.addEventListener('change', function() {
		var file = fileToAll.files[0];
		console.log(file);
		var i = 0;
		console.log(peers);
		for (i; i < peers.length; i++) {
			peers[i].sendFile(file);
		}
		$('#conversation').append("<p class='file'>You just send a file named '" + file.name + "'</p><a href='" + URL.createObjectURL(file) + "' download='" + file.name + "'>Download</a>");
		$(".mes.active").removeClass("active");
	});

    ////

});

