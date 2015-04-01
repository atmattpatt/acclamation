/* jshint jasmine:true */
'use strict';

var redis = require('../../src/redisClient');
var CardResource = require('../../src/models/cardResource');
var CardsResource = require('../../src/models/cardsResource');
var SessionResource = require('../../src/models/sessionResource');
var SessionStateResource = require('../../src/models/sessionStateResource');
var TemperatureResource = require('../../src/models/temperatureResource');

describe('SessionResource', function() {
  beforeEach(function() {
    var done = false;
    runs(function() {
      redis.del('acclamation:sessions', function() { done = true; });
    });
    waitsFor(function() { return done === true; }, 1000);
  });

  describe('constructor', function() {
    it('takes a sessionId', function() {
      var sessionResource = new SessionResource('test-session-id');
      expect(sessionResource.id).toEqual('test-session-id');
    });
  });

  describe('get()', function() {
    it('resolves to a new Session instance if the session exists', function() {
      var doneAdding = false, doneFinding = false;

      runs(function() {
        redis.sadd('acclamation:sessions', 'test-session-id', function() {
          doneAdding = true;
        });
      });
      waitsFor(function() { return doneAdding === true; }, 1000);

      runs(function() {
        (new SessionResource('test-session-id')).get().then(function(session) {
          expect(session.id).toEqual('test-session-id');
          doneFinding = true;
        });
      });
      waitsFor(function() { return doneFinding === true; }, 1000);
    });

    it('rejects with an error if the session does not exist', function() {
      var done = false;

      runs(function() {
        (new SessionResource('non-existent-session')).get().catch(function(err) {
          expect(err.message).toEqual('Session not found');
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });
  });

  describe('create()', function() {
    it('generates a session UUID', function() {
      var done = false;

      runs(function() {
        (new SessionResource()).create().then(function(session) {
          expect(
            /^[A-F0-9]{8}\-[A-F0-9]{4}\-[A-F0-9]{4}\-[A-F0-9]{4}\-[A-F0-9]{12}$/i.test(session.id)
          ).toBe(true);
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });

    it('tracks the sessionId', function() {
      var done = false;

      runs(function() {
        var sessionResource = new SessionResource();
        sessionResource.create().then(function(session) {
          expect(sessionResource.id).toEqual(session.id);
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });

    it('adds the session UUID to acclamation:sessions', function() {
      var done = false;

      runs(function() {
        (new SessionResource()).create().then(function(session) {
          (new SessionResource(session.id)).get().then(function(foundSession) {
            expect(foundSession.id).toEqual(session.id);
            done = true;
          });
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });
  });

  describe('temperature()', function() {
    it('returns a TemperatureResource for the session', function() {
      var sessionResource = new SessionResource('test-session-id');
      var temperatureResource = sessionResource.temperature();
      expect(temperatureResource.constructor).toEqual(TemperatureResource);
      expect(temperatureResource.session).toEqual(sessionResource);
    });
  });

  describe('sessionState()', function() {
    it('returns a SessionStateResource for the session', function() {
      var sessionResource = new SessionResource('test-session-id');
      var sessionStateResource = sessionResource.sessionState();
      expect(sessionStateResource.constructor).toEqual(SessionStateResource);
      expect(sessionStateResource.session).toEqual(sessionResource);
    });
  });

  describe('card()', function() {
    it('returns a CardResource for the session and card requested', function() {
      var sessionResource = new SessionResource('test-session-id');
      var cardResource = sessionResource.card('test-card-id');
      expect(cardResource.constructor).toEqual(CardResource);
      expect(cardResource.session).toEqual(sessionResource);
      expect(cardResource.id).toEqual('test-card-id');
    });
  });

  describe('cards()', function() {
    it('returns a CardsResource for the session', function() {
      var sessionResource = new SessionResource('test-session-id');
      var cardsResource = sessionResource.cards();
      expect(cardsResource.constructor).toEqual(CardsResource);
      expect(cardsResource.session).toEqual(sessionResource);
    });
  });
});
