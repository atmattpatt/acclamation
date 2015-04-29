/* jshint jasmine:true */
'use strict';

var redis = require('../../src/redisClient');
var SessionResource = require('../../src/models/sessionResource');
var SessionsResource = require('../../src/models/sessionsResource');

describe('SessionsResource', function() {
  describe('all()', function() {
    beforeEach(function() {
      var created = 0;
      runs(function() {
        redis.hset('acclamation:sessions', 'test-session-1', '{"id":"test-session-1"}', function() { created++; });
        redis.hset('acclamation:sessions', 'test-session-2', '{"id":"test-session-2"}', function() { created++; });
        redis.hset('acclamation:sessions', 'test-session-3', '{"id":"test-session-3"}', function() { created++; });
      });
      waitsFor(function() { return created === 3; }, 1000);
    });

    it('returns an array of all sessions', function() {
      var done = false;

      runs(function() {
        var sessionsResource = new SessionsResource();
        sessionsResource.all().then(function(sessions) {
          var sessionIds = sessions.map(function(session) {
            return session.id;
          });

          expect(sessionIds).toContain('test-session-1');
          expect(sessionIds).toContain('test-session-2');
          expect(sessionIds).toContain('test-session-3');
          done = true;
        });
      });
      waitsFor(function() { return done === true; });
    });
  });

  describe('create()', function() {
    it('generates a session UUID', function() {
      var done = false;

      runs(function() {
        (new SessionsResource()).create({name: 'test session'}).then(function(session) {
          expect(
            /^[A-F0-9]{8}\-[A-F0-9]{4}\-[A-F0-9]{4}\-[A-F0-9]{4}\-[A-F0-9]{12}$/i.test(session.id)
          ).toBe(true);
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });

    it('provides a default name', function() {
      var done = false;

      runs(function() {
        (new SessionsResource()).create({}).then(function(sessionResource) {
          sessionResource.get().then(function(session) {
            expect(session.name).toEqual('Unnamed session');
            done = true;
          });
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });

    it('resolves with a SessionResource', function() {
      var done = false;

      runs(function() {
        var sessionsResource = new SessionsResource();
        sessionsResource.create({}).then(function(sessionResource) {
          expect(sessionResource.constructor).toEqual(SessionResource);
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });

    it('adds the session redis', function() {
      var done = false;

      runs(function() {
        (new SessionsResource()).create({name: 'test session'}).then(function(session) {
          (new SessionResource(session.id)).get().then(function(foundSession) {
            expect(foundSession.id).toEqual(session.id);
            expect(foundSession.name).toEqual('test session');
            done = true;
          });
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });
  });
});
