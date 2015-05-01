'use strict';

var promise = require('promise');
var redis = require('../redisClient');
var SessionState = require('./sessionState');

var SessionStateResource = function(session) {
  this.session = session;
  this.redisKey = 'acclamation:session:' + session.id + ':state';
};

SessionStateResource.prototype.get = function() {
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
    self.get().then(function(state) {
      for (var key in state) {
        if (state.hasOwnProperty(key) && values[key] !== undefined) {
          state[key] = (values[key] === 'true');
        }
      }

      redis.set(self.redisKey, JSON.stringify(state), function(err, res) {
        if (err !== null) {
          reject(err);
        } else {
          resolve(new SessionState(state));
        }
      });
    });
  });
};

module.exports = SessionStateResource;
