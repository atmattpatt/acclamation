/* jshint jasmine:true */
'use strict';

var redis = require('../../src/redisClient');
var CardResource = require('../../src/models/cardResource');
var CardsResource = require('../../src/models/cardsResource');
var SessionResource = require('../../src/models/sessionResource');

describe('CardsResource', function() {
  var session;

  beforeEach(function() {
    session = undefined;
    runs(function() {
      (new SessionResource()).create().then(function(createdSession) { session = createdSession; });
    });
    waitsFor(function() { return session !== undefined; });
  });

  describe('constructor', function() {
    it('takes a session', function() {
      var cardsResource = new CardsResource(session);
      expect(cardsResource.session).toEqual(session);
    });
  });

  describe('all()', function() {
    beforeEach(function() {
      var created = 0;

      function createCard(n) {
        var cardData = {
          id: 'test-card-id' + n,
          type: 'card-type',
          topic: 'card-topic',
          title: 'Card Title' + n,
        };
        redis.hset('acclamation:session:' + session.id + ':cards', cardData.id, JSON.stringify(cardData), function() {
          created++;
        });
      }

      runs(function() {
        for (var i = 0; i < 3; i++) {
          createCard(i);
        }
      });
      waitsFor(function() { return created === 3; }, 1000);
    });

    it('returns an array of all cards', function() {
      var done = false;

      runs(function() {
        var cardsResource = new CardsResource(session);
        cardsResource.all().then(function(cards) {
          expect(cards.length).toEqual(3);
          expect(cards.map(function(card) {
            return card.id;
          }).sort()).toEqual(['test-card-id0', 'test-card-id1', 'test-card-id2']);
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });

    it('returns an empty array when no cards exist', function() {
      var done = false;

      runs(function() {
        var cardsResource = new CardsResource(new SessionResource('non-existent-session-id'));
        cardsResource.all().then(function(cards) {
          expect(cards.length).toEqual(0);
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });
  });

  describe('create()', function() {
    var cardData = {
      type: 'card-type',
      topic: 'card-topic',
      title: 'Card Title'
    };

    it('returns a CardResource representing the card', function() {
      var done = false;

      runs(function() {
        (new CardsResource(session)).create(cardData).then(function(cardResource) {
          expect(cardResource.constructor).toEqual(CardResource);
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });

    it('generates a card UUID', function() {
      var done = false;

      runs(function() {
        (new CardsResource(session)).create(cardData).then(function(card) {
          expect(
            /^[A-F0-9]{8}\-[A-F0-9]{4}\-[A-F0-9]{4}\-[A-F0-9]{4}\-[A-F0-9]{12}$/i.test(card.id)
          ).toBe(true);
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });

    it('adds the card to redis', function() {
      var done = false;

      runs(function() {
        (new CardsResource(session)).create(cardData).then(function(card) {
          card.get().then(function(card) {
            expect(card.type).toEqual(cardData.type);
            expect(card.topic).toEqual(cardData.topic);
            expect(card.title).toEqual(cardData.title);
            done = true;
          });
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });
  });
});
