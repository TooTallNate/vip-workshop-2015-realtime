var http = require('http');
var sio = require('socket.io');
var config = require('./config');
var sub = require('redis').createClient(config.redis);
var redis = require('redis').createClient(config.redis);

var server = http.createServer(function (req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('This is a socket.io "Presence" server for VIP WordPress.com!\n');
});

var io = sio(server);

io.adapter(require('socket.io-redis')(config.redis));

io.on('connection', function (socket) {
  console.log('socket %j connected', socket.id);
  var first = true;

  // the client sends a "viewing" event upon connection
  socket.on('viewing', function(postId) {
    console.log('%j is viewing post ID %j', socket.id, postId);

    var multi = redis.multi()
      // update session with refreshed TTL and set value to current post id
      .setex('session:' + socket.id, config.sessionTTL, String(postId))
      // update the global session -> postid hash with current post id
      .hset('viewers', socket.id, String(postId))
      // update the postid-specific viewers Set to contain this socket.id
      .sadd('viewers:' + postId, socket.id);

    if (first) {
      console.log('incrementing "views" count for post ID %j', postId);
      multi.incr('views:' + postId);
      first = false;
    }

    multi.exec(function (err, results) {
      if (err) throw err;
      // at this point, the ":viewers:*" Redis subscription (defined below)
      // will be invoked since we did `SADD viewers:[postId] [socket.id]`,
      // and all connected clients will be notified of the updated viewer count
    });
  });

  // delete the Session key from Redis upon "disconnect".
  // the GC script takes care of removing the `viewers` hash entry,
  // and removing the `viewers:[postId]` set entry for this session ID
  socket.on('disconnect', function () {
    console.log('%j disconnected', socket.id);

    redis.del('session:' + socket.id, function (err, result) {
      if (err) throw err;
    });
  });

});


// subscribe to Redis "viewers:*" and "views:*" keyspace events
sub.on('pmessage', function (pattern, channel, message) {
  console.log('"pmessage" event. pattern=%j channel=%j message=%j', pattern, channel, message);

  var parts = channel.split(':');
  var postId = parts.pop();
  var key = parts.pop();

  if ('views' === key) {
    // relay the new number of total views to connected Socket.IO clients
    redis.get('views:' + postId, function (err, count) {
      if (err) throw err;
      io.emit('views', postId, count);
    });

  } else if ('viewers' === key) {
    // relay the new count of viewers to connected Socket.IO clients
    // based on the SCARD of the `viewers:<post-id>` Set
    redis.scard('viewers:' + postId, function (err, count) {
      if (err) throw err;
      io.emit('viewers', postId, count);
    });
  }
});

sub.psubscribe('__keyspace*__:viewers:*');
sub.psubscribe('__keyspace*__:views:*');


// bind HTTP server
server.listen(config.bind, function (err) {
  console.log('IO server listening on port %d', server.address().port);
});
