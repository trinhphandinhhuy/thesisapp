lamkRTC.controller("roomController", function ($rootScope, $scope, $routeParams, $location) {
    // grab the room from the URL
    var room = $routeParams.roomName;

    // create our webrtc connection
    var webrtc = new SimpleWebRTC({
        // the id/element dom element that will hold "our" video
        localVideoEl: 'localVideo',
        // the id/element dom element that will hold remote videos
        remoteVideosEl: '',
        // immediately ask for camera access
        autoRequestMedia: true,
        // signaling server
        url: "https://hieudoan.com:9999",
        debug: false,
        detectSpeakingEvents: true,
        autoAdjustMic: false
    });

    // when it's ready, join if we got a room from the URL
    webrtc.on('readyToCall', function () {
        // if already got a room, then join it
        if (room) {
            webrtc.joinRoom(room);
        }
    });

    // we got access to the camera and microphone
    webrtc.on('localStream', function (stream) {

        //toggle webcam on/off
        var video = stream.getVideoTracks()[0];
        $("button[name='video']").click(function () {
            video.enabled = !video.enabled;
            $("button[name='video']").toggleClass("btn-success").toggleClass("btn-danger");
            $("button[name='video'] i").toggleClass("fa-video-camera").toggleClass("fa-pause");
            $("#video i").toggleClass("fa-video-camera").toggleClass("fa-pause");
        });

        //toggle microphone on/off
        var audio = stream.getAudioTracks()[0];
        $("button[name='audio']").click(function () {
            audio.enabled = !audio.enabled;
            $("button[name='audio']").toggleClass("btn-success").toggleClass("btn-danger");
            $("button[name='audio'] i").toggleClass("fa-microphone").toggleClass("fa-microphone-slash");
            $("#audio i").toggleClass("fa-microphone").toggleClass("fa-microphone-slash");
        });
    });

    // we did not get access to the camera
    webrtc.on('localMediaError', function (err) {
        alert("Can't get access to camera");
    });

    // a peer video has been added
    webrtc.on('videoAdded', function (video, peer) {
        console.log('video added', peer);
        var from = typeof peer.nick != "undefined" ? peer.nick : peer.id;
        notification("videoAdded",from);
        var remotes = document.getElementById('remotes');
        if (remotes) {
            var container = document.createElement('div');
            container.className = 'col-sm-6';
            container.id = 'container_' + webrtc.getDomId(peer);
            container.appendChild(video);
            // suppress contextmenu
            // show the ice connection state
            if (peer && peer.pc) {
                var connstate = document.createElement('div');
                connstate.className = 'connectionstate text-center';
                container.appendChild(connstate);
                peer.pc.on('iceConnectionStateChange', function (event) {
                    switch (peer.pc.iceConnectionState) {
                        case 'checking':
                            connstate.innerText = 'Connecting to peer...';
                            break;
                        case 'connected':
                        case 'completed': // on caller side
                            connstate.innerText = 'Connection established.';
                            if ($scope.nick != "Input your username") {
                                webrtc.sendDirectlyToAll(room, 'nick', $scope.nick);
                            }
                            break;
                        case 'disconnected':
                            connstate.innerText = 'Disconnected.';
                            break;
                        case 'failed':
                            connstate.innerText = 'Connection failed.';
                            break;
                        case 'closed':
                            connstate.innerText = 'Connection closed.';
                            break;
                    }
                });
            }
            remotes.appendChild(container);
        }

    });
    // a peer was removed
    webrtc.on('videoRemoved', function (video, peer) {
        console.log('video removed ', peer);
        var from = typeof peer.nick != "undefined" ? peer.nick : peer.id;
        notification("videoRemoved",from);
        var remotes = document.getElementById('remotes');
        var el = document.getElementById(peer ? 'container_' + webrtc.getDomId(peer) : 'localScreenContainer');
        if (remotes && el) {
            remotes.removeChild(el);
        }
    });

    // local p2p/ice failure
    webrtc.on('iceFailed', function (peer) {
        var connstate = document.querySelector('#container_' + webrtc.getDomId(peer) + ' .connectionstate');
        console.log('local fail', connstate);
        if (connstate) {
            connstate.innerText = 'Connection failed.';
            fileinput.disabled = 'disabled';
        }
    });
    // remote p2p/ice failure
    webrtc.on('connectivityError', function (peer) {
        var connstate = document.querySelector('#container_' + webrtc.getDomId(peer) + ' .connectionstate');
        console.log('remote fail', connstate);
        if (connstate) {
            connstate.innerText = 'Connection failed.';
            fileinput.disabled = 'disabled';
        }
    });

    //Copy Link to clip board
    $scope.url = $location.$$absUrl;

    //Send chat
    $scope.sendMessage = function () {
        var id = $(".mes.active").attr("id");
        console.log();
        webrtc.sendDirectlyToAll(room, 'chat', $scope.message);
        if (id != "me") {
            $(".mes.active").removeClass("active");
            $('#conversation').append("<div id='me' class='mes me active'>" +
                "<p class='from'>Me</p>" +
                "<p class='content'></p>" +
                "</div>");
        }
        $(".mes.active .content").append($scope.message + "<br>");


        $scope.message = "";
    };

    //Set Nickname
    $scope.nick = "Input your username";
    $scope.editing = false;
    $scope.setNick = function () {
        webrtc.sendDirectlyToAll(room, 'nick', $scope.nick);
    };
    $scope.editItem = function () {
        $scope.editing = true;
         $scope.nick = "";
    };
    $scope.doneEditing = function () {
        $scope.editing = false;
        if ($scope.nick != "Input your username" && $scope.nick != "") {
            webrtc.sendDirectlyToAll(room, 'nick', $scope.nick);
        } else if ($scope.nick == "") {
            $scope.nick = "Input your username";
        }
    };

    //Receiving chat type + nick type
    webrtc.on('channelMessage', function (peer, label, data) {
        if (data.type === 'chat') {
            var id = peer.id;
            var activeID = $(".mes.active").attr("id");
            var from = typeof peer.nick == "undefined" ? id : peer.nick;
            if (activeID != id) {
                $(".mes.active").removeClass("active");
                $('#conversation').append("<div id='" + id + "' class='mes other active'>" +
                    "<p class='from'>" + from + "</p>" +
                    "<p class='content'>" + data.payload + "<br>" + "</p>" +
                    "</div>");
            } else {
                $(".mes.active .content").append(data.payload + "<br>");
            }

        } else if (data.type === 'nick') {
            var from = typeof peer.nick != "undefined" ? peer.nick : peer.id;
            notification("changeName", from, data.payload);
            peer.nick = data.payload;
        } else if (data.type === 'lockStatus') {
            if (data.payload == 'true') {
                $("button[name='lock'] i").toggleClass("fa-lock").toggleClass("fa-unlock");
            } else {
                $("button[name='lock'] i").toggleClass("fa-unlock").toggleClass("fa-lock");
            }
        }
    });

    //Leave room
    $scope.leave = function () {
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
                console.log('state', state);
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
    fileToAll.addEventListener('change', function () {
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

    //Lock room
/*
    $("button[name='lock']").click(function ($rootScope) {
        var lockStat = "";
        if ($("button[name='lock'] i").hasClass("fa-unlock")) {
            //$scope.update("true");
            $scope.update({
                roomName: room,
                roomStatus: true
            });
        } else {
            //$scope.update("false");
            $scope.update({
                roomName: room,
                roomStatus: false
            });
        }
        console.log($scope.roomStatus() );
        $("button[name='lock'] i").toggleClass("fa-lock").toggleClass("fa-unlock");
        webrtc.sendDirectlyToAll(room, 'lockStatus', $scope.roomStatus());
    });*/
});
