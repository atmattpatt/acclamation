'use strict';

var promise = require('promise');
var redis = require('../redisClient');
var SessionState = require('./sessionState');

var SessionStateResource = function(session) {
  this.session = session;
  this.redisKey = 'acclamation:session:' + session.id + ':state';
};

SessionStateResource.prototype.fetch = function() {
  var self = this;
  return new promise(function(resolve, reject) {
    redis.get(self.redisKey, function(err, res) {
      if (err !== null) {
        reject(err);
      } else {
        try {
          resolve(new SessionState(JSON.parse(res)));
        } catch(e) {
          reject(e);
        }
      }
    });
  });
};

SessionStateResource.prototype.update = function(values) {
  var self = this;
  return new promise(function(resolve, reject) {
    redis.set(self.redisKey, JSON.stringify(values), function(err, res) {
      if (err !== null) {
        reject(err);
      } else {
        resolve(new SessionState(values));
      }
    });
  });
};

module.exports = SessionStateResource;
