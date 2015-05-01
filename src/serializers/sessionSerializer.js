'use strict';

var async = require('async');
var promise = require('promise');
var CardSerializer = require('./cardSerializer');

function deepFindCard(haystack, needleId) {
  var subsearch;
  for (var i = 0; i < haystack.length; i++) {
    if (haystack[i].id === needleId) {
      return haystack[i];
    } else if (haystack[i].children !== undefined) {
      subsearch = deepFindCard(haystack[i].children, needleId);
      if (subsearch !== null) {
        return subsearch;
      }
    }
  }

  return null;
}

function makeCardTree(cards) {
  var cardsDup = cards.slice();
  var card, parent;

  for (var i = 0; i < cardsDup.length; i++) {
    card = deepFindCard(cards, cardsDup[i].id);
    if (card !== null && card.parent !== undefined) {
      parent = deepFindCard(cards, card.parent);
      parent.children = parent.children || [];
      parent.children.push(card);

      for (var j = 0; j < cards.length; j++) {
        if (cards[j].id === card.id) {
          cards.splice(j, 1);
        }
      }
    }
  }

  return cards;
}

var SessionSerializer = function(sessionResource) {
  this.sessionResource = sessionResource;
};

SessionSerializer.prototype.serialize = function() {
  var self = this;

  return new promise(function(resolve, reject) {
    async.parallel(
      {
        temperature: function(callback) {
          self.sessionResource.temperature().get().then(function(temperature) {
            callback(null, temperature);
          });
        },
        cards: function(callback) {
          async.waterfall(
            [
              function(callback) {
                self.sessionResource.cards().all().then(function(cards) {
                  callback(null, cards);
                });
              },
              function(cards, callback) {
                async.map(
                  cards,
                  function(card, callback) {
                    (new CardSerializer(self.sessionResource.card(card.id)))
                      .serialize()
                      .then(function(serialized) {
                        callback(null, serialized);
                      });
                  }, function(err, results) {
                    callback(null, results);
                  });
              },
              function(cards, callback) {
                var cardTree = makeCardTree(cards);
                callback(null, cardTree);
              }
            ], function(err, results) {
              callback(null, results);
            });
        }
      },
      function(err, results) {
        resolve({
          temperature: results.temperature.values,
          cards: results.cards
        });
      });
  });
};

module.exports = SessionSerializer;
