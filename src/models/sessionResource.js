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
    redis.hget(self.redisKey, self.id, function(err, res) {
      if (err !== null) {
        reject(err);
      } else if (res === null) {
        reject(new Error('Session not found'));
      } else {
        try {
          resolve(new Session(JSON.parse(res)));
        } catch(e) {
          reject(e);
        }
      }
    });
  });
};

SessionResource.prototype.destroy = function() {
  var self = this;
  return new promise(function(resolve, reject) {
    redis.hdel(self.redisKey, self.id, function(err, res) {
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
