/* jshint jasmine:true */
'use strict';

var redis = require('../../src/redisClient');
var SessionResource = require('../../src/models/sessionResource');
var TemperatureResource = require('../../src/models/temperatureResource');

describe('TemperatureResource', function() {
  var session;

  beforeEach(function() {
    var populated = 0;

    session = undefined;
    runs(function() {
      (new SessionResource()).create().then(function(createdSession) { session = createdSession; });
    });
    waitsFor(function() { return session !== undefined; });

    runs(function() {
      redis.hset('acclamation:session:' + session.id + ':temperature', '1', 2, function() { populated++; });
      redis.hset('acclamation:session:' + session.id + ':temperature', '2', 4, function() { populated++; });
      redis.hset('acclamation:session:' + session.id + ':temperature', '3', 8, function() { populated++; });
      redis.hset('acclamation:session:' + session.id + ':temperature', '4', 16, function() { populated++; });
      redis.hset('acclamation:session:' + session.id + ':temperature', '5', 32, function() { populated++; });
    });
    waitsFor(function() { return populated === 5; }, 1000);
  });

  describe('constructor', function() {
    it('takes a session', function() {
      var temperatureResource = new TemperatureResource(session);
      expect(temperatureResource.session).toEqual(session);
    });
  });

  describe('get()', function() {
    it('loads the temperature values from redis', function() {
      var done = false;

      runs(function() {
        var temperatureResource = new TemperatureResource(session);
        temperatureResource.get().then(function(temperature) {
          expect(temperature.values['1']).toEqual(2);
          expect(temperature.values['2']).toEqual(4);
          expect(temperature.values['3']).toEqual(8);
          expect(temperature.values['4']).toEqual(16);
          expect(temperature.values['5']).toEqual(32);
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });
  });

  describe('increment()', function() {
    it('increments the number of votes for a given value', function() {
      var done = false;

      runs(function() {
        var temperatureResource = new TemperatureResource(session);
        temperatureResource.increment('4').then(function() {
          temperatureResource.get().then(function(temperature) {
            expect(temperature.values['1']).toEqual(2);
            expect(temperature.values['2']).toEqual(4);
            expect(temperature.values['3']).toEqual(8);
            expect(temperature.values['4']).toEqual(17);
            expect(temperature.values['5']).toEqual(32);
            done = true;
          });
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });

    it('resolves with the TemperatureResource', function() {
      var done = false;

      runs(function() {
        var temperatureResource = new TemperatureResource(session);
        temperatureResource.increment('4').then(function(resource) {
          expect(resource).toEqual(temperatureResource);
          done = true;
        });
      });
      waitsFor(function() { return done === true; }, 1000);
    });
  });
});
