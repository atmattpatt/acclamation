'use strict';

var promise = require('promise');
var redis = require('../redisClient');
var uuid = require('uuid');
var Session = require('./session');

var SessionResource = function() {
  this.redisKey = 'acclamation:sessions';
};

SessionResource.prototype.find = function(sessionId) {
  var self = this;
  return new promise(function(resolve, reject) {
    redis.sismember(self.redisKey, sessionId, function(err, res) {
      if (err !== null) {
        reject(err);
      } else if (res === 1) {
        resolve(new Session({id: sessionId}));
      } else {
        reject(new Error('Session not found'));
      }
    });
  });
};

SessionResource.prototype.create = function() {
  var sessionId = uuid.v4();
  return new promise(function(resolve, reject) {
    redis.sadd('acclamation:sessions', sessionId, function(err, res) {
      if (err !== null) {
        reject(err);
      } else {
        resolve(new Session({id: sessionId}));
      }
    });
  });
};

module.exports = SessionResource;
