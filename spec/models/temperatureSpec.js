/* jshint jasmine:true */
'use strict';

var redis = require('../../src/redisClient');
var Temperature = require('../../src/models/temperature');

describe('Temperature', function() {
  beforeEach(function() {
    var reset = 0;

    runs(function() {
      redis.flushdb(function() {
        redis.hset('temperature', '1', 0, function() { reset++; });
        redis.hset('temperature', '2', 0, function() { reset++; });
        redis.hset('temperature', '3', 0, function() { reset++; });
        redis.hset('temperature', '4', 0, function() { reset++; });
        redis.hset('temperature', '5', 0, function() { reset++; });
      });
    });
    waitsFor(function() {
      return reset === 5;
    }, 1000);
  });

  describe('increment()', function() {
    it('increments the number of votes for a given value', function() {
      var done = false;
      runs(function() {
        (new Temperature()).increment('4', function() {
          (new Temperature()).load(function(temperature) {
            expect(temperature.getValues()['1']).toEqual(0);
            expect(temperature.getValues()['2']).toEqual(0);
            expect(temperature.getValues()['3']).toEqual(0);
            expect(temperature.getValues()['4']).toEqual(1);
            expect(temperature.getValues()['5']).toEqual(0);
            done = true;
          });
        });
      });

      waitsFor(function() {
        return done;
      }, 1000);
    });
  });
});
