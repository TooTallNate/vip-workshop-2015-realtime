var config = require('./config');
var sub = require('redis').createClient(config.redis);
var redis = require('redis').createClient(config.redis);

sub.on('psubscribe', function (pattern, count) {
  console.log('"psubscribe" event. pattern=%j count=%j', pattern, count);
});

sub.on('pmessage', function (pattern, channel, message) {
  console.log('"pmessage" event. pattern=%j channel=%j message=%j', pattern, channel, message);

  if ('expired' === message || 'del' === message) {
    // get post that the session was visiting
    var socketId = channel.split(':').pop();

    redis.hget('viewers', socketId, function (err, postId) {
      if (err) throw err;
      redis.multi()
        .srem('viewers:' + postId, socketId)
        .hdel('viewers', socketId)
        .exec(function (err, results) {
          if (err) throw err;
        });
    });
  }
});

sub.psubscribe('__keyspace*__:session:*');
