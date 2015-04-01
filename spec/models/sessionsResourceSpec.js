/* jshint jasmine:true */
'use strict';

var SessionResource = require('../../src/models/sessionResource');
var SessionsResource = require('../../src/models/sessionsResource');

describe('SessionsResource', function() {
  describe('create()', function() {
    it('generates a session UUID', function() {
      var done = false;

      runs(function() {
        (new SessionsResource()).create().then(function(session) {
          expect(
            /^[A-F0-9]{8}\-[A-F0-9]{4}\-[A-F0-9]{4}\-[A-F0-9]{4}\-[A-F0-9]{12}$/i.test(session.id)
          ).toBe(true);
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });

    it('resolves with a SessionResource', function() {
      var done = false;

      runs(function() {
        var sessionsResource = new SessionsResource();
        sessionsResource.create().then(function(sessionResource) {
          expect(sessionResource.constructor).toEqual(SessionResource);
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });

    it('adds the session UUID to acclamation:sessions', function() {
      var done = false;

      runs(function() {
        (new SessionsResource()).create().then(function(session) {
          (new SessionResource(session.id)).get().then(function(foundSession) {
            expect(foundSession.id).toEqual(session.id);
            done = true;
          });
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });
  });
});
