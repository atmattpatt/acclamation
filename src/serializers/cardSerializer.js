'use strict';

var async = require('async');
var promise = require('promise');

var CardSerializer = function(cardResource) {
  this.cardResource = cardResource;
};

CardSerializer.prototype.serialize = function() {
  var self = this;

  return new promise(function(resolve, reject) {
    async.parallel(
      {
        card: function(callback) {
          self.cardResource.get().then(function(card) {
            callback(null, card);
          });
        },
        cardVote: function(callback) {
          self.cardResource.vote().get().then(function(cardVote) {
            callback(null, cardVote);
          });
        }
      }, function(err, results) {
        resolve({
          id: results.card.id,
          type: results.card.type,
          topic: results.card.topic,
          title: results.card.title,
          parent: results.card.parent,
          author: results.card.author,
          votes: results.cardVote.votes
        });
      }
    );
  });
};

module.exports = CardSerializer;
