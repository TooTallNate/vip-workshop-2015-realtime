# vip-workshop-2015-realtime

This is the repository for the socket.io server used in
@TooTallNate's talk for the Automattic VIP Workshop 2015.

Basically it's a demonstration of how you can add realtime
capabilities to your WordPress VIP installation, by having
the web browser connect to a Node.js socket.io server hosted
somewhere on your infrastructure.

In this particular example, we add realtime "presence"
capabilities. That is, **how many other people are viewing
this post?**

The solution? Socket.IO and Redis.

<div style="text-align: center">
  <img src="http://cdn.socket.io/website/imgs/logo.svg" width="50%" /><br>
  +<br>
  <img src="http://upload.wikimedia.org/wikipedia/en/6/6b/Redis_Logo.svg" width="40%" />
</div>


### Redis Schema

 * `viewers` - Hash
 * `viewers:<post-id>` - Set
 * `session:<socket-id>` - String, with 11 minute expiration TTL
