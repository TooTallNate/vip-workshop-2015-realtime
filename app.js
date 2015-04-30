var http = require('http');
var sio = require('socket.io');
var redisOpts = { host: '127.0.0.1', port: 6379 };
var sub = require('redis').createClient(redisOpts);
var redis = require('redis').createClient(redisOpts);

var server = http.createServer(function (req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('This is a socket.io "Presence" server for VIP WordPress.com!\n');
});

var sessionTTL = 1 * 60; // 1 minute (in seconds)

var io = sio(server);

io.adapter(require('socket.io-redis')(redisOpts));

io.on('connection', function (socket) {
  console.log('socket %j connected', socket.id);

  socket.on('viewing', function(postId) {
    console.log('%j is viewing post ID %j', socket.id, postId);

    redis.multi()
      // update session with refreshed TTL and set value to current post id
      .setex('session:' + socket.id, sessionTTL, String(postId))
      // update the global session -> postid hash with current post id
      .hset('viewers', socket.id, String(postId))
      // update the postid-specific viewers Set to contain this socket.id
      .sadd('viewers:' + postId, socket.id)
      .exec(function (err, results) {
        if (err) throw err;
        console.log(arguments);
      });
  });

  socket.on('disconnect', function () {
    console.log('%j disconnected', socket.id);

    redis.del('session:' + socket.id, function (err, result) {
      if (err) throw err;
      console.log(arguments);
    });
  });

});


// subscribe to Redis "viewers:*" keyspace events
sub.on('pmessage', function (pattern, channel, message) {
  console.log('"pmessage" event. pattern=%j channel=%j message=%j', pattern, channel, message);

  var postId = channel.split(':').pop();
  redis.scard('viewers:' + postId, function (err, count) {
    if (err) throw err;
    console.log(arguments);
    io.emit('viewers', postId, count);
  });
});

sub.psubscribe('__keyspace*__:viewers:*');


// bind HTTP server
server.listen(3000, function (err) {
  console.log('IO server listening on port %d', server.address().port);
});