/* jshint jasmine:true */
'use strict';

var redis = require('../../src/redisClient');
var CardVoteResource = require('../../src/models/cardVoteResource');
var CardsResource = require('../../src/models/cardsResource');
var SessionsResource = require('../../src/models/sessionsResource');

describe('CardVoteResource', function() {
  var session;
  var card;

  beforeEach(function() {
    var done;

    session = undefined;
    card = undefined;

    runs(function() {
      (new SessionsResource()).create({}).then(function(createdSession) { session = createdSession; });
    });
    waitsFor(function() { return session !== undefined; }, 1000);

    runs(function() {
      (new CardsResource(session)).create({}).then(function(createdCard) { card = createdCard; });
    });
    waitsFor(function() { return card !== undefined; }, 1000);

    runs(function() {
      redis.set('acclamation:session:' + session.id + ':card:' + card.id + ':votes', 2, function() { done = true; });
    });
    waitsFor(function() { return done === true; }, 1000);
  });

  describe('constructor', function() {
    it('takes a session and a card', function() {
      var cardVoteResource = new CardVoteResource(session, card);
      expect(cardVoteResource.session).toEqual(session);
      expect(cardVoteResource.card).toEqual(card);
    });
  });

  describe('get()', function() {
    it('loads the number of votes from redis', function() {
      var done = false;

      runs(function() {
        var cardVoteResource = new CardVoteResource(session, card);
        cardVoteResource.get().then(function(cardVote) {
          expect(cardVote.votes).toEqual(2);
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });
  });

  describe('increment()', function() {
    it('increments the number of votes for a given card', function() {
      var done = false;

      runs(function() {
        var cardVoteResource = new CardVoteResource(session, card);
        cardVoteResource.increment().then(function() {
          cardVoteResource.get().then(function(cardVote) {
            expect(cardVote.votes).toEqual(3);
            done = true;
          });
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });

    it('decrements the number of votes for a given card', function() {
      var done = false;

      runs(function() {
        var cardVoteResource = new CardVoteResource(session, card);
        cardVoteResource.increment(-1).then(function() {
          cardVoteResource.get().then(function(cardVote) {
            expect(cardVote.votes).toEqual(1);
            done = true;
          });
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });

    it('resolves with a CardVoteResource', function() {
      var done = false;

      runs(function() {
        var cardVoteResource = new CardVoteResource(session, card);
        cardVoteResource.increment().then(function(resource) {
          expect(resource).toEqual(cardVoteResource);
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });
  });
});
