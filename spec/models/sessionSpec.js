/* jshint jasmine:true */
'use strict';

var redis = require('../../src/redisClient');
var Session = require('../../src/models/session');

describe('Session', function() {
  describe('find()', function() {
    it('resolves to a new Session instance if the session exists', function() {
      var doneAdding = false, doneFinding = false;
      var session;

      runs(function() {
        redis.sadd('acclamation.sessions', 'test-session-id', function() {
          doneAdding = true;
        });
      });
      waitsFor(function() {
        return doneAdding === true;
      }, 1000);

      runs(function() {
        session = new Session();
        session.find('test-session-id').then(function() {
          expect(session.id()).toEqual('test-session-id');
          doneFinding = true;
        });
      });
      waitsFor(function() {
        return doneFinding === true;
      }, 1000);
    });

    it('rejects with an error if the session does not exist', function() {
      var done = false;
      var session;

      runs(function() {
        session = new Session();
        session.find('non-existent-session').catch(function(err) {
          expect(err.message).toEqual('Session not found');
          done = true;
        });
      });
      waitsFor(function() {
        return done === true;
      }, 1000);
    });
  });

  describe('create()', function() {
  });
});
