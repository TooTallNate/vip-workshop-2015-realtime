# vip-workshop-2015-realtime

This is the repository for the socket.io server used in
@TooTallNate's talk for the Automattic VIP Workshop 2015.

Basically it's a demonstration of how you can add realtime
capabilities to your WordPress VIP installation, by having
the web browser connect to a Node.js socket.io server hosted
somewhere on your infrastructure.

In this particular example, we add realtime "presence"
capabilities. That is:

> **How many other people are viewing this post?**

The solution? Socket.IO and Redis.

## Socket.IO

[<img src="http://cdn.socket.io/website/imgs/logo.svg" width="50%" />](http://socket.io)

Socket.IO is a realtime application server, written in JavaScript for Node.js.
It allows bi-directional event-based message passing between connected clients
and the server. Similar in concept to WebSockets, but Socket.IO offers features
common to realtime applications like reconnection and packet buffering.


## Redis

[<img src="http://upload.wikimedia.org/wikipedia/en/6/6b/Redis_Logo.svg" width="50%" />](http://redis.io)


### Redis Schema

#### `viewers` - Hash

Hash that contains _all_ sessions as keys, and their last known
post being viewed at the value.

Used when a session is expired/deleted to look up the last known
post that the user was viewing, so that the corresponding
`viewers:<post-id>` Set can have its entry removed.

```
127.0.0.1:6379> HGETALL viewers
1) "mXbcRrQtsjpdKbmsAAAX"
2) "13"
```

#### `viewers:<post-id>` - Set

Set that contains all the session IDs that are currently viewing `post-id`.

Used to get the overall "presence" count for a given post.

```
127.0.0.1:6379> SMEMBERS viewers:13
1) "mXbcRrQtsjpdKbmsAAAX"
```

#### `session:<socket-id>` - String

String with an 11 minute expiration time (TTL, configurable in `./config.js`).
The contents of the string are not actually used, instead the existence of
the key is enough to signify that the session is still "alive".

Used to create and destroy "session" instances. Redis' EXPIRES command is
leveraged to have the database expire the keys automatically.

```
127.0.0.1:6379> GET session:mXbcRrQtsjpdKbmsAAAX
"13"
```


--------------------

## Quick Start

``` bash
$ git clone git://github.com/TooTallNate/vip-workshop-2015-realtime.git
$ cd vip-workshop-2015-realtime
$ npm install
$ node app &   # spawn application server
$ node gc &    # spawn "garbage collection" server
```

### `app.js` - Application "Presence" Server

The first piece of this example is the "application server", which is the actual
Socket.IO server.

When a new Socket.IO connection is established, the client side sends a "


### `gc.js` - "Garbage Collection" Server
