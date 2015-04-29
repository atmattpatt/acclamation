'use strict';

var promise = require('promise');
var redis = require('../redisClient');
var CardVote = require('./cardVote');

var CardVoteResource = function(session, card) {
  this.session = session;
  this.card = card;
  this.redisKey = 'acclamation:session:' + session.id  + ':card:' + card.id + ':votes';
};

CardVoteResource.prototype.get = function() {
  var self = this;
  return new promise(function(resolve, reject) {
    redis.get(self.redisKey, function(err, res) {
      if (err !== null) {
        reject(err);
      } else {
        resolve(new CardVote({votes: Number(res)}));
      }
    });
  });
};

CardVoteResource.prototype.increment = function(incrBy) {
  var self = this;
  return new promise(function(resolve, reject) {
    redis.incrby(self.redisKey, incrBy || 1, function(err, res) {
      if (err !== null) {
        reject(err);
      } else {
        resolve(self);
      }
    });
  });
};

module.exports = CardVoteResource;
