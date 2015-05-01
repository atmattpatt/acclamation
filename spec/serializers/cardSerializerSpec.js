/* jshint jasmine:true */
'use strict';

var CardSerializer = require('../../src/serializers/cardSerializer');
var CardsResource = require('../../src/models/cardsResource');
var SessionsResource = require('../../src/models/sessionsResource');

describe('CardSerializer', function() {
  var session;
  var card;
  var cardResource;

  beforeEach(function() {
    var done;

    session = undefined;
    card = undefined;

    runs(function() {
      (new SessionsResource()).create({}).then(function(createdSession) { session = createdSession; });
    });
    waitsFor(function() { return session !== undefined; }, 1000);

    runs(function() {
      (new CardsResource(session)).create({
        type: 'card',
        title: 'Test card',
        author: 'Zoidberg'
      }).then(function(createdCardResource) {
        cardResource = createdCardResource;
        cardResource.get().then(function(createdCard) {
          card = createdCard;
        });
      });
    });
    waitsFor(function() { return card !== undefined; }, 1000);

    runs(function() {
      cardResource.vote().increment(5).then(function() { done = true; });
    });
    waitsFor(function() { return done === true; }, 1000);
  });

  describe('serialize()', function() {
    it('serializes the card data', function() {
      var done = false;
      runs(function() {
        var serializer = new CardSerializer(cardResource);
        serializer.serialize().then(function(serialized) {
          expect(serialized.id).toEqual(card.id);
          expect(serialized.type).toEqual(card.type);
          expect(serialized.topic).toEqual(card.topic);
          expect(serialized.title).toEqual(card.title);
          expect(serialized.parent).toEqual(card.parent);
          expect(serialized.author).toEqual(card.author);
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });

    it('serializes the vote count', function() {
      var done = false;
      runs(function() {
        var serializer = new CardSerializer(cardResource);
        serializer.serialize().then(function(serialized) {
          expect(serialized.votes).toEqual(5);
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });
  });
});
