/**
 * This is the "client-side" part of the "presence" demo
 * for @TooTallNate's "WordPress.com VIP + Socket.IO" talk
 * at the VIP Workshop 2015 in Napa, CA.
 */

var socket = io('http://198.199.108.45:3000');
var viewers = jQuery('#viewers b');
var viewerCount = jQuery('#view-count b');
var viewingTimeout;

/**
 * This function gets called upon the initial socket.io server
 * connection, and refreshes
 */

function notifyViewing () {
	// `post.post_id` is defined by `wp_localize_script()`
	// in the `content.php` script
        console.log('emitting "viewing" event with post_id=%j', post.post_id);
	socket.emit('viewing', post.post_id);
	clearTimeout(viewingTimeout);
	viewingTimeout = setTimeout(notifyViewing, 1000 * 60 * 10 /* 10 minutes in ms */);
}

socket.on('connect', function () {
	console.log('Connected to socket.io server!');
	notifyViewing();
});

socket.on('viewers', function (id, count) {
	console.log('"viewers" event, id=%j count=%j', id, count);
	if (id === post.post_id) {
		viewers.text(count);
	}
});

socket.on('view count', function (id, count) {
	console.log('"view count" event, id=%j count=%j', id, count);
	if (id === post.post_id) {
		viewCount.text(count);
	}
});

socket.on('disconnect', function () {
	console.log('Disconnected from socket.io server!');
});
