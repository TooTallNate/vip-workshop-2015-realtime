/**
 * This is the "client-side" part of the "presence" demo
 * for @TooTallNate's "WordPress.com VIP + Socket.IO" talk
 * at the VIP Workshop 2015 in Napa, CA.
 */

var socket = io('http://198.199.108.45:3000');
var viewers = jQuery('.viewers b');
var viewsCount = jQuery('.view-count b');
var viewingTimeout;

/**
 * This function gets called upon the initial socket.io server
 * connection, and every 10 minutes while the page remains open.
 * It refreshes the user's "session" object in the Redis
 * database by sending the "viewing" event to Socket.IO.
 */

function notifyViewing () {
	// `post.post_id` is defined by `wp_localize_script()`
	// in the `content.php` script
        console.log('emitting "viewing" event with post_id=%o', post.post_id);
	socket.emit('viewing', post.post_id);
	clearTimeout(viewingTimeout);
	viewingTimeout = setTimeout(notifyViewing, 1000 * 60 * 10 /* 10 minutes in ms */);
}

// upon "connect" event, call notifyViewing()
socket.on('connect', function () {
	console.log('Connected to socket.io server!');
	notifyViewing();
});

// upon "viewers" event, update the `viewers` count node
socket.on('viewers', function (id, count) {
	console.log('"viewers" event, id=%o count=%o', id, count);
	if (id === post.post_id) {
		viewers.text(count);
	}
});

// upon "views" event, update the `viewsCount` count node
socket.on('views', function (id, count) {
	console.log('"views" event, id=%o count=%o', id, count);
	if (id === post.post_id) {
		viewsCount.text(count);
	}
});

// upon "disconnect" event, just log it to the console for now
socket.on('disconnect', function () {
	console.log('Disconnected from socket.io server!');
});
