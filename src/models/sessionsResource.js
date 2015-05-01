'use strict';

var promise = require('promise');
var redis = require('../redisClient');
var uuid = require('uuid');
var Session = require('./session');
var SessionResource = require('./sessionResource');

var SessionsResource = function() {
  this.redisKey = 'acclamation:sessions';
};

SessionsResource.prototype.all = function() {
  var self = this;
  return new promise(function(resolve, reject) {
    redis.hgetall(self.redisKey, function(err, res) {
      var sessions = [];

      if (err !== null) {
        reject(err);
      } else {
        for (var session in res) {
          if (res.hasOwnProperty(session)) {
            try {
              sessions.push(new Session(JSON.parse(res[session])));
            } catch (e) {}
          }
        }
        resolve(sessions);
      }
    });
  });
};

SessionsResource.prototype.create = function(sessionData) {
  var self = this;
  sessionData.id = uuid.v4();
  sessionData.name = sessionData.name || 'Unnamed session';

  return new promise(function(resolve, reject) {
    redis.hset(self.redisKey, sessionData.id, JSON.stringify(sessionData), function(err, res) {
      if (err !== null) {
        reject(err);
      } else {
        resolve(new SessionResource(sessionData.id));
      }
    });
  });
};

module.exports = SessionsResource;
