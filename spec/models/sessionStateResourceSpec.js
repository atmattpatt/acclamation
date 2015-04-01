/* jshint jasmine:true */
'use strict';

var redis = require('../../src/redisClient');
var SessionsResource = require('../../src/models/sessionsResource');
var SessionStateResource = require('../../src/models/sessionStateResource');

describe('SessionStateResource', function() {
  var session;

  beforeEach(function() {
    var populated = false;

    session = undefined;
    runs(function() {
      (new SessionsResource()).create().then(function(createdSession) { session = createdSession; });
    });
    waitsFor(function() { return session !== undefined; });

    runs(function() {
      var initialState = {
        allowNewCards: true,
        allowVoting: false
      };
      redis.set('acclamation:session:' + session.id + ':state', JSON.stringify(initialState), function() { populated = true; });
    });
    waitsFor(function() { return populated === true; }, 1000);
  });

  describe('constructor', function() {
    it('takes a session', function() {
      var sessionStateResource = new SessionStateResource(session);
      expect(sessionStateResource.session).toEqual(session);
    });
  });

  describe('get()', function() {
    it('loads state from redis', function() {
      var done = false;

      runs(function() {
        var sessionStateResource = new SessionStateResource(session);
        sessionStateResource.get().then(function(state) {
          expect(state.allowNewCards).toEqual(true);
          expect(state.allowVoting).toEqual(false);
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });
  });

  describe('update()', function() {
    it('updates state values', function() {
      var done = false;

      runs(function() {
        var sessionStateResource = new SessionStateResource(session);
        sessionStateResource.update({
          allowNewCards: 'false',
          allowVoting: 'true'
        }).then(function(state) {
          expect(state.allowNewCards).toEqual(false);
          expect(state.allowVoting).toEqual(true);
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });
  });
});
