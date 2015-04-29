'use strict';

var promise = require('promise');
var redis = require('../redisClient');
var CardResource = require('./cardResource');
var CardsResource = require('./cardsResource');
var Session = require('./session');
var SessionStateResource = require('./sessionStateResource');
var TemperatureResource = require('./temperatureResource');

var SessionResource = function(sessionId) {
  this.id = sessionId;
  this.redisKey = 'acclamation:sessions';
};

SessionResource.prototype.get = function() {
  var self = this;
  return new promise(function(resolve, reject) {
    redis.sismember(self.redisKey, self.id, function(err, res) {
      if (err !== null) {
        reject(err);
      } else if (res === 1) {
        resolve(new Session({id: self.id}));
      } else {
        reject(new Error('Session not found'));
      }
    });
  });
};

SessionResource.prototype.destroy = function() {
  var self = this;
  return new promise(function(resolve, reject) {
    redis.srem(self.redisKey, self.id, function(err, res) {
      if (err !== null) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

SessionResource.prototype.card = function(cardId) {
  return new CardResource(this, cardId);
};

SessionResource.prototype.cards = function() {
  return new CardsResource(this);
};

SessionResource.prototype.sessionState = function() {
  return new SessionStateResource(this);
};

SessionResource.prototype.temperature = function() {
  return new TemperatureResource(this);
};

module.exports = SessionResource;
