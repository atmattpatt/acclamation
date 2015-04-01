'use strict';

var promise = require('promise');
var redis = require('../redisClient');
var uuid = require('uuid');
var Card = require('./card');
var CardResource = require('./cardResource');

var CardsResource = function(session) {
  this.session = session;
  this.redisKey = 'acclamation:session:' + session.id + ':cards';
};

CardsResource.prototype.all = function() {
  var self = this;
  return new promise(function(resolve, reject) {
    redis.hgetall(self.redisKey, function(err, res) {
      var cards = [];
      if (err !== null) {
        reject(err);
      } else {
        for (var key in res) {
          if (res.hasOwnProperty(key)) {
            try {
              cards.push(new Card(JSON.parse(res[key])));
            } catch(e) {
              reject(e);
            }
          }
        }
        resolve(cards);
      }
    });
  });
};

CardsResource.prototype.create = function(cardData) {
  var self = this;
  cardData.id = uuid.v4();
  return new promise(function(resolve, reject) {
    redis.hset(self.redisKey, cardData.id, JSON.stringify(cardData), function(err, res) {
      if (err !== null) {
        reject(err);
      } else {
        resolve(new CardResource(self.session, cardData.id));
      }
    });
  });
};

module.exports = CardsResource;
