'use strict';
angular.module('ngClickCopy', []).service('ngCopy', ['$window', function($window) {
    var body = angular.element($window.document.body);
    var textarea = angular.element('<textarea/>');
    textarea.css({
        position: 'fixed',
        opacity: '0'
    });
    return {
        CopyToClipBoard: function(toCopy) {
            textarea.val(toCopy);
            body.append(textarea);
            textarea[0].select();
            try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful . Link has been saved to clipboard. Send it to your friend to start group chat' : 'unsuccessful. Use manual copy + paste to send the link to your friends.';
                alert('Copying command was ' + msg);
            } catch (err) {
                alert("Copy to clipboard: Ctrl+C, Enter", toCopy);
            }
            textarea.remove();
        }
    }
}]).directive('ngClickCopy', ['ngCopy', function(ngCopy) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function(e) {
                ngCopy.CopyToClipBoard(attrs.ngClickCopy);
            });
        }
    }
}])
