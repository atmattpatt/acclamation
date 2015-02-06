/* jshint jasmine:true */
'use strict';

var redis = require('../../src/redisClient');
var Session = require('../../src/models/session');
var Temperature = require('../../src/models/temperature');

describe('Temperature', function() {
  var session;

  beforeEach(function() {
    var populated = 0;

    session = undefined;
    runs(function() {
      (new Session()).create().then(function(createdSession) {
        session = createdSession;
      });
    });
    waitsFor(function() {
      return session !== undefined;
    });

    runs(function() {
      redis.hset('acclamation:session:' + session.id() + ':temperature', '1', 2, function() { populated++; });
      redis.hset('acclamation:session:' + session.id() + ':temperature', '2', 4, function() { populated++; });
      redis.hset('acclamation:session:' + session.id() + ':temperature', '3', 8, function() { populated++; });
      redis.hset('acclamation:session:' + session.id() + ':temperature', '4', 16, function() { populated++; });
      redis.hset('acclamation:session:' + session.id() + ':temperature', '5', 32, function() { populated++; });
    });
    waitsFor(function() {
      return populated === 5;
    }, 1000);
  });

  describe('constructor', function() {
    it('takes a session', function() {
      var temperature = new Temperature(session);
      expect(temperature.session).toEqual(session);
    });

    it('throws if a session is not provided', function() {
      expect(function () {
        new Temperature();
      }).toThrow();
    });
  });

  describe('load()', function() {
    it('loads the temperature values from redis', function() {
      var done = false;
      var temperature;

      runs(function() {
        temperature = new Temperature(session);
        temperature.load().then(function(temperature) {
          expect(temperature.getValues()['1']).toEqual(2);
          expect(temperature.getValues()['2']).toEqual(4);
          expect(temperature.getValues()['3']).toEqual(8);
          expect(temperature.getValues()['4']).toEqual(16);
          expect(temperature.getValues()['5']).toEqual(32);
          done = true;
        });
      });
      waitsFor(function() {
        return done === true;
      }, 1000);
    });
  });

  describe('increment()', function() {
    it('increments the number of votes for a given value', function() {
      var done = false;
      var temperature;

      runs(function() {
        temperature = new Temperature(session);
        temperature.increment('4').then(function() {
          temperature.load().then(function(temperature) {
            expect(temperature.getValues()['1']).toEqual(2);
            expect(temperature.getValues()['2']).toEqual(4);
            expect(temperature.getValues()['3']).toEqual(8);
            expect(temperature.getValues()['4']).toEqual(17);
            expect(temperature.getValues()['5']).toEqual(32);
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
