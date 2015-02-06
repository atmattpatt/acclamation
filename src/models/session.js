'use strict';

var config = require('../config');
var promise = require('promise');
var qr = require('qr-image');
var redis = require('../redisClient');

var Session = function(defaults) {
  this.id = defaults.id;
};

Session.prototype.destroy = function() {
  var self = this;
  return new promise(function(resolve, reject) {
    redis.srem('acclamation:sessions', self.id, function(err, res) {
      if (err !== null) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

Session.prototype.qr = function() {
  return qr.image(config.server.baseUrl + '/client/' + this.id, { type: 'png', size: 8 });
};

module.exports = Session;
