'use strict';

var promise = require('promise');
var redis = require('../redisClient');
var Card = require('./card');

var CardResource = function(session, cardId) {
  this.session = session;
  this.id = cardId;
  this.redisKey = 'acclamation:session:' + session.id + ':cards';
};

CardResource.prototype.get = function() {
  var self = this;
  return new promise(function(resolve, reject) {
    redis.hget(self.redisKey, self.id, function(err, res) {
      if (err !== null) {
        reject(err);
      } else if (res === null) {
        reject(new Error('Card not found'));
      } else {
        try {
          resolve(new Card(JSON.parse(res)));
        } catch(e) {
          reject(e);
        }
      }
    });
  });
};

CardResource.prototype.update = function(values) {
  var self = this;
  return new promise(function(resolve, reject) {
    self.get().then(function(card) {
      for (var key in card) {
        if (card.hasOwnProperty(key) && values[key] !== undefined) {
          card[key] = values[key];
        }
      }

      redis.hset(self.redisKey, self.id, JSON.stringify(card), function(err, res) {
        if (err !== null) {
          reject(err);
        } else {
          resolve(card);
        }
      });
    });
  });
};

module.exports = CardResource;
