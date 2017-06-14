'use strict';

function notification(event, peer1, peer2) {
    var e = function(message, color) {
        this.message = message;
        this.color = color;
    };
    var trigger = {
        "videoAdded": new e(peer1 + " has joined the room", "green"),
        "videoRemoved": new e(peer1 + " has left the room", "red"),
        "changeName": new e(peer1 + " changes their name to " + peer2, "blue"),
        "lockRoom": new e("Room is now locked", "green"),
        "unlockRoom": new e("Room is now unlocked", "red"),
        "successfulCopy": new e("Copying command was successful . Link has been saved to clipboard. Send it to your friend to start group chat", "blue"),
        "unsuccessfulCopy": new e("Copying command was unsuccessful. Use manual copy + paste to send the link to your friends.", "red")
    };
    var noti = $("<div class='noti " + trigger[event].color + "'>" + trigger[event].message + "</div>");
    $("#notification").append(noti);
    var time = 250;
    noti.fadeIn(time);
    setTimeout(function() {
        noti.fadeOut(time);
    }, 5000);
};
