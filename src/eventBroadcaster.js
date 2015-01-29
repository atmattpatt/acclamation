'use strict';

var RedisClientFactory = require('./redisClientFactory');

var EventBroadcaster = function(app) {
  this.app = app;
  this.redis = (new RedisClientFactory()).createClient();
};

EventBroadcaster.prototype.start = function() {
  var app = this.app;

  this.redis.on('message', function(channel, message) {
    var parsed, event, data;
    if (channel !== 'acclamation:events') {
      return;
    }

    try {
      parsed = JSON.parse(message);
    } catch (e) {
      console.log('Rejecting message, could not JSON parse', message);
      return;
    }

    if (typeof parsed !== 'object') {
      console.log('Rejecting message, not a JSON object', message);
      return;
    }

    event = parsed.event;
    if (event === undefined) {
      console.log('Rejecting message, undefined event', message);
      return;
    }

    data = parsed.data;

    console.log('Broadcasting event', event, data);
    app.io.broadcast(event, data);
  });
  this.redis.subscribe('acclamation:events');
};

module.exports = EventBroadcaster;
