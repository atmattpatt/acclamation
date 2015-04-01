'use strict';

var promise = require('promise');
var redis = require('../redisClient');
var uuid = require('uuid');
var SessionResource = require('./sessionResource');

var SessionsResource = function() {
  this.redisKey = 'acclamation:sessions';
};

SessionsResource.prototype.create = function() {
  var self = this;
  var sessionId = uuid.v4();
  return new promise(function(resolve, reject) {
    redis.sadd(self.redisKey, sessionId, function(err, res) {
      if (err !== null) {
        reject(err);
      } else {
        resolve(new SessionResource(sessionId));
      }
    });
  });
};

module.exports = SessionsResource;
