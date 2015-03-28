/* jshint jasmine:true */
'use strict';

var redis = require('../../src/redisClient');
var CardResource = require('../../src/models/cardResource');
var SessionResource = require('../../src/models/sessionResource');

describe('CardResource', function() {
  var session;

  beforeEach(function() {
    session = undefined;
    runs(function() {
      (new SessionResource()).create().then(function(createdSession) { session = createdSession; });
    });
    waitsFor(function() { return session !== undefined; });
  });

  beforeEach(function() {
    var done = false;

    runs(function() {
      var cardData = {
        id: 'test-card-id',
        type: 'card-type',
        topic: 'card-topic',
        title: 'Card Title',
        parent: 'parent-card-id'
      };
      redis.hset('acclamation:session:' + session.id + ':cards', 'test-card-id', JSON.stringify(cardData), function() {
        done = true;
      });
    });
    waitsFor(function() { return done === true; }, 1000);
  });

  describe('constructor', function() {
    it('takes a session and a cardId', function() {
      var cardResource = new CardResource(session, 'test-card-id');
      expect(cardResource.session).toEqual(session);
      expect(cardResource.id).toEqual('test-card-id');
    });
  });

  describe('get()', function() {
    it('loads the card from redis', function() {
      var done = false;

      runs(function() {
        var cardResource = new CardResource(session, 'test-card-id');
        cardResource.get().then(function(card) {
          expect(card.id).toEqual('test-card-id');
          expect(card.type).toEqual('card-type');
          expect(card.topic).toEqual('card-topic');
          expect(card.title).toEqual('Card Title');
          expect(card.parent).toEqual('parent-card-id');
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });

    it('rejects with an error if the card does not exist', function() {
      var done = false;

      runs(function() {
        var cardResource = new CardResource(session, 'non-existent-card-id');
        cardResource.get().catch(function(err) {
          expect(err.message).toEqual('Card not found');
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });
  });

  describe('update()', function() {
    it('updates values in redis', function() {
      var done = false;

      runs(function() {
        var cardResource = new CardResource(session, 'test-card-id');
        cardResource.update({
          type: 'new-type',
          topic: 'new-topic',
          title: 'New Title',
          parent: 'new-parent-card-id'
        }).then(function(card) {
          expect(card.type).toEqual('new-type');
          expect(card.topic).toEqual('new-topic');
          expect(card.title).toEqual('New Title');
          expect(card.parent).toEqual('new-parent-card-id');
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });
  });
});
