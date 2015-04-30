var redisOpts = { host: '127.0.0.1', port: 6379 };
var sub = require('redis').createClient(redisOpts);
var redis = require('redis').createClient(redisOpts);

sub.on('psubscribe', function (pattern, count) {
  console.log('"psubscribe" event. pattern=%j count=%j', pattern, count);
  console.log(arguments);
});

sub.on('pmessage', function (pattern, channel, message) {
  console.log('"pmessage" event. pattern=%j channel=%j message=%j', pattern, channel, message);
  console.log(arguments);

  if ('expired' === message || 'del' === message) {
    // get post that the session was visiting
    var socketId = channel.split(':').pop();

    redis.hget('viewers', socketId, function (err, postId) {
      console.log(arguments);
      redis.multi()
        .srem('viewers:' + postId, socketId)
        .hdel('viewers', socketId)
        .exec(function (err, results) {
          console.log(arguments);
        });
    });
  }
});

sub.psubscribe('__keyspace*__:session:*');