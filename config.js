// Redis config settings
exports.redis = {
  host: '127.0.0.1',
  port: 6379
};

// How long (in seconds) to persist the "post viewing" sesion in Redis
exports.sessionTTL = 30 * 60; // 30 minutes
