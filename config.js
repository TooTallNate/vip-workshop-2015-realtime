// Redis config settings
exports.redis = {
  host: '127.0.0.1',
  port: 6379
};

// How long (in seconds) to persist the "post viewing" sesion in Redis
// Setting to 11 minutes on the server-side, since the client-side refreshes
// the session every 10 minutes, so just over the refresh timeout
exports.sessionTTL = 60 * 11;
