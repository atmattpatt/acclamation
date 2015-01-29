/* jshint jasmine:true */
'use strict';

var redis = require('../../src/redisClient');
var Session = require('../../src/models/session');

describe('Session', function() {
  beforeEach(function() {
    var done = false;
    runs(function() {
      redis.flushdb(function() {
        done = true;
      });
    });
    waitsFor(function() {
      return done === true;
    }, 1000);
  });

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
    it('generates a session UUID', function() {
      var done = false;
      var session;

      runs(function() {
        session = new Session();
        session.create().then(function() {
          expect(
            /^[A-F0-9]{8}\-[A-F0-9]{4}\-[A-F0-9]{4}\-[A-F0-9]{4}\-[A-F0-9]{12}$/i.test(session.id())
          ).toBe(true);
          done = true;
        });
      });
      waitsFor(function() {
        return done === true;
      }, 1000);
    });

    it('adds the session UUID to acclamation.sessions', function() {
      var done = false;
      var session;

      runs(function() {
        session = new Session();
        session.create().then(function() {
          var foundSession = new Session();
          foundSession.find(session.id()).then(function() {
            expect(foundSession.id()).toEqual(session.id());
            done = true;
          });
        });
      });
      waitsFor(function() {
        return done === true;
      }, 1000);
    });
  });

  describe('destroy()', function() {
    beforeEach(function() {
      var done = false;
      runs(function() {
        redis.sadd('acclamation.sessions', 'test-session-id', function() {
          done = true;
        });
      });
      waitsFor(function() {
        return done === true;
      }, 1000);
    });

    it('removes the session UUID from acclamation.sessions', function() {
      var done = false;
      var session;
      runs(function() {
        session = new Session();
        session.find('test-session-id').then(function() {
          session.destroy().then(function() {
            redis.sismember('acclamation.sessions', 'test-session-id', function(err, res) {
              expect(res).toEqual(0);
              done = true;
            });
          });
        });
      });
      waitsFor(function() {
        return done === true;
      }, 1000);
    });
  });
});
