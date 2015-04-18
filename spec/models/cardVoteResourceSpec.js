/* jshint jasmine:true */
'use strict';

var redis = require('../../src/redisClient');
var CardVoteResource = require('../../src/models/cardVoteResource');
var CardResource = require('../../src/models/cardResource');
var CardsResource = require('../../src/models/cardsResource');
var SessionsResource = require('../../src/models/sessionsResource');

describe('CardVoteResource', function() {
  var session;
  var card;

  beforeEach(function() {
    session = undefined;
    card = undefined;
    runs(function() {
      (new SessionsResource()).create().then(function(createdSession) { session = createdSession; });
    });
    waitsFor(function() { return session !== undefined; });
    runs(function() {
      (new CardsResource(session)).create({}).then(function(createdCard) { card = createdCard; });
    });
    waitsFor(function() { return card !== undefined; });
  });

  describe('constructor', function() {
    it('takes a session and a card', function() {
      var cardVoteResource = new CardVoteResource(session, card);
      expect(cardVoteResource.session).toEqual(session);
      expect(cardVoteResource.card).toEqual(card);
    });
  });
});
