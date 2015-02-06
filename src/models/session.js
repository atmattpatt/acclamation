'use strict';

var config = require('../config');
var Promiss = require('promise');
var qr = require('qr-image');
var redis = require('../redisClient');
var uuid = require('uuid');

module.exports = function() {
  var id = null;
  var self = this;

  this.id = function() {
    return id;
  };

  this.create = function() {
    id = uuid.v4();
    return new Promiss(function(resolve, reject) {
      redis.sadd('acclamation:sessions', id, function(err, res) {
        if (err !== null) {
          reject(err);
        } else {
          resolve(self);
        }
      });
    });
  };

  this.destroy = function () {
    return new Promiss(function(resolve, reject) {
      redis.srem('acclamation:sessions', id, function(err, res) {
        if (err !== null) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  this.find = function(sessionId) {
    return new Promiss(function(resolve, reject) {
      redis.sismember('acclamation:sessions', sessionId, function(err, res) {
        if (err !== null) {
          reject(err);
        } else if (res === 1) {
          id = sessionId;
          resolve(self);
        } else {
          reject(new Error('Session not found'));
        }
      });
    });
  };

  this.qr = function() {
    return qr.image(config.server.baseUrl + '/client/' + this.id(), { type: 'png', size: 8 });
  };
};
