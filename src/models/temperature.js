'use strict';

var promise = require('promise');
var redis = require('../redisClient');

module.exports = function(session) {
  var values = {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0};
  var self = this;

  if (session === undefined || session === null) {
    throw new Error('A session is required for instantiating Temperature');
  }

  this.session = session;

  this.getValues = function() {
    return values;
  };

  this.load = function() {
    return new promise(function(resolve, reject) {
      redis.hgetall(self.redisKey(), function(err, res) {
        if (err !== null) {
          reject(err);
        } else {
          if (typeof res === 'object' && res !== null) {
            ['1', '2', '3', '4', '5'].map(function(key) {
              values[key] = Number(res[key]);
            });
          }
          resolve(self);
        }
      });
    });
  };

  this.increment = function(key, done) {
    return new promise(function(resolve, reject) {
      var skey = String(key);
      redis.hincrby(self.redisKey(), skey, 1, function(err, res) {
        if (err !== null) {
          reject(err);
        } else {
          values[skey]++;
          resolve(self);
        }
      });
    });
  };

  this.redisKey = function() {
    return 'acclamation:session:' + this.session.id() + ':temperature';
  };
};
