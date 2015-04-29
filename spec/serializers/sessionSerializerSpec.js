/* jshint jasmine:true */
'use strict';

var SessionSerializer = require('../../src/serializers/sessionSerializer');
var CardsResource = require('../../src/models/cardsResource');
var SessionsResource = require('../../src/models/sessionsResource');

describe('SessionSerializer', function() {
  var session;
  var card;
  var cardResource;

  beforeEach(function() {
    var done;
    var temperature = 0;

    session = undefined;
    card = undefined;

    runs(function() {
      (new SessionsResource()).create({}).then(function(createdSession) { session = createdSession; });
    });
    waitsFor(function() { return session !== undefined; }, 1000);

    runs(function() {
      session.temperature().increment(1).then(function() { temperature++; });
      session.temperature().increment(2).then(function() { temperature++; });
      session.temperature().increment(3).then(function() { temperature++; });
      session.temperature().increment(3).then(function() { temperature++; });
      session.temperature().increment(4).then(function() { temperature++; });
      session.temperature().increment(4).then(function() { temperature++; });
      session.temperature().increment(5).then(function() { temperature++; });
      session.temperature().increment(5).then(function() { temperature++; });
      session.temperature().increment(5).then(function() { temperature++; });
      session.temperature().increment(5).then(function() { temperature++; });
    });
    waitsFor(function() { return temperature === 10; }, 1000);

    runs(function() {
      (new CardsResource(session)).create({
        type: 'card',
        title: 'Test card'
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
    it('serializes the temperature', function() {
      var done = false;
      runs(function() {
        var serializer = new SessionSerializer(session);
        serializer.serialize().then(function(serialized) {
          expect(serialized.temperature).toEqual({
            1: 1,
            2: 1,
            3: 2,
            4: 2,
            5: 4
          });
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });

    it('serializes the cards', function() {
      var done = false;
      runs(function() {
        var serializer = new SessionSerializer(session);
        serializer.serialize().then(function(serialized) {
          expect(serialized.cards[0].id).toEqual(card.id);
          expect(serialized.cards[0].type).toEqual(card.type);
          expect(serialized.cards[0].topic).toEqual(card.topic);
          expect(serialized.cards[0].title).toEqual(card.title);
          expect(serialized.cards[0].parent).toEqual(card.parent);
          expect(serialized.cards[0].votes).toEqual(5);
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });

    it('correctly nests cards', function() {
      var done = false;
      var childCard;

      runs(function() {
        (new CardsResource(session)).create({
          parent: card.id,
        }).then(function(cardResource) {
          cardResource.get().then(function(createdCard) {
            childCard = createdCard;
          });
        });
      });
      waitsFor(function() { return childCard !== undefined; }, 1000);

      runs(function() {
        var serializer = new SessionSerializer(session);
        serializer.serialize().then(function(serialized) {
          console.log('serialized', serialized);
          expect(serialized.cards[0].children[0].id).toEqual(childCard.id);
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });
  });
});
