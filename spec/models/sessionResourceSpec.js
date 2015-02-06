/* jshint jasmine:true */
'use strict';

var redis = require('../../src/redisClient');
var SessionResource = require('../../src/models/sessionResource');

describe('SessionResource', function() {
  beforeEach(function() {
    var done = false;
    runs(function() {
      redis.del('acclamation:sessions', function() { done = true; });
    });
    waitsFor(function() { return done === true; }, 1000);
  });

  describe('find()', function() {
    it('resolves to a new Session instance if the session exists', function() {
      var doneAdding = false, doneFinding = false;

      runs(function() {
        redis.sadd('acclamation:sessions', 'test-session-id', function() {
          doneAdding = true;
        });
      });
      waitsFor(function() { return doneAdding === true; }, 1000);

      runs(function() {
        (new SessionResource()).find('test-session-id').then(function(session) {
          expect(session.id).toEqual('test-session-id');
          doneFinding = true;
        });
      });
      waitsFor(function() { return doneFinding === true; }, 1000);
    });

    it('rejects with an error if the session does not exist', function() {
      var done = false;

      runs(function() {
        (new SessionResource()).find('non-existent-session').catch(function(err) {
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

    it('adds the session UUID to acclamation:sessions', function() {
      var done = false;

      runs(function() {
        (new SessionResource()).create().then(function(session) {
          (new SessionResource()).find(session.id).then(function(foundSession) {
            expect(foundSession.id).toEqual(session.id);
            done = true;
          });
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });
  });
});
