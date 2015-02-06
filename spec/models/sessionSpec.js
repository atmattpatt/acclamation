/* jshint jasmine:true */
'use strict';

var redis = require('../../src/redisClient');
var Session = require('../../src/models/session');

describe('Session', function() {
  beforeEach(function() {
    var done = false;
    runs(function() {
      redis.del('acclamation:sessions', function() { done = true; });
    });
    waitsFor(function() { return done === true; }, 1000);
  });

  describe('destroy()', function() {
    beforeEach(function() {
      var done = false;
      runs(function() {
        redis.sadd('acclamation:sessions', 'test-session-id', function() { done = true; });
      });
      waitsFor(function() { return done === true; }, 1000);
    });

    it('removes the session UUID from acclamation:sessions', function() {
      var done = false;
      var session;
      runs(function() {
        session = new Session({id: 'test-session-id'});
        session.destroy().then(function() {
          redis.sismember('acclamation:sessions', 'test-session-id', function(err, res) {
            expect(res).toEqual(0);
            done = true;
          });
        });
      });
      waitsFor(function() {
        return done === true;
      }, 1000);
    });
  });
});
