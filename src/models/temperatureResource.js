'use strict';

var promise = require('promise');
var redis = require('../redisClient');
var Temperature = require('./Temperature');

var TemperatureResource = function(session) {
  this.session = session;
  this.redisKey = 'acclamation:session:' + session.id + ':temperature';
};

TemperatureResource.prototype.get = function() {
  var self = this;
  return new promise(function(resolve, reject) {
    redis.hgetall(self.redisKey, function(err, res) {
      var values = {};

      if (err !== null) {
        reject(err);
      } else {
        if (typeof res === 'object' && res !== null) {
          ['1', '2', '3', '4', '5'].map(function(key) {
            values[key] = Number(res[key]) || 0;
          });
        }

        resolve(new Temperature({values: values}));
      }
    });
  });
};

TemperatureResource.prototype.increment = function(key) {
  var self = this;
  return new promise(function(resolve, reject) {
    var skey = String(key);
    redis.hincrby(self.redisKey, skey, 1, function(err, res) {
      if (err !== null) {
        reject(err);
      } else {
        resolve(self);
      }
    });
  });
};

module.exports = TemperatureResource;
