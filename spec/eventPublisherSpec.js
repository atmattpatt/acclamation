/* jshint jasmine:true */
'use strict';

var EventPublisher = require('../src/eventPublisher');
var RedisClientFactory = require('../src/redisClientFactory');

describe('EventPublisher', function() {
  describe('publish()', function() {
    var messages;
    var redis;

    beforeEach(function() {
      var done = false;

      messages = [];

      runs(function() {
        redis = (new RedisClientFactory()).createClient();
        redis.on('message', function(channel, message) {
          messages.push(message);
        });
        redis.on('subscribe', function() {
          done = true;
        });
        redis.subscribe('acclamation:events');
      });
      waitsFor(function() { return done === true; }, 1000);
    });

    afterEach(function() {
      redis.unsubscribe('acclamation:events');
      redis.quit();
    });

    it('publishes a message to redis', function() {
      var eventPublisher = new EventPublisher('acclamation:events');

      runs(function() {
        eventPublisher.publish('test-event', 'test-session', {data: true});
      });
      waitsFor(function() { return messages.length > 0; }, 10000);

      runs(function() {
        var message = JSON.parse(messages[0]);
        expect(message.event).toEqual('test-event');
        expect(message.session).toEqual('test-session');
        expect(message.data).toEqual({data: true});
      });
    });
  });
});
