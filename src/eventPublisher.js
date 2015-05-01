'use strict';

var redis = require('./redisClient');

var EventPublisher = function(topic) {
  this.topic = topic;
};

EventPublisher.prototype.publish = function(event, sessionId, data) {
  var message = JSON.stringify({
    event: event,
    session: sessionId,
    data: data
  });

  console.log('Publishing event for session', event, sessionId, data);
  redis.publish(this.topic, message);
};

module.exports = EventPublisher;
