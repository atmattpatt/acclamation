/* jshint jasmine:true */
'use strict';

var redis = require('../src/redisClient');
var EventBroadcaster = require('../src/eventBroadcaster');

describe('EventBroadcaster', function() {
  describe('start()', function() {
    it('broadcasts the event to listening sockets', function() {
      var broadcastSpy = jasmine.createSpy('broadcast');
      var room = {broadcast: broadcastSpy};
      var roomSpy = jasmine.createSpy('room').andReturn(room);
      var app = {io: {room: roomSpy, broadcast: broadcastSpy}};
      var eventBroadcaster = new EventBroadcaster(app);
      var messageCount = 0;
      var ready = false, done = false;

      eventBroadcaster.start();

      runs(function() {
        eventBroadcaster.redis.on('subscribe', function() {
          eventBroadcaster.redis.on('message', function() {
            messageCount++;
          });
          ready = true;
        });
      });
      waitsFor(function() { return ready === true; }, 1001);

      runs(function() {
        redis.publish('acclamation:events', JSON.stringify({
          event: 'test-event',
          session: 'test-session',
          data: {data: true}
        }));
      });
      waitsFor(function() { return messageCount > 0; }, 1000);

      runs(function() {
        expect(roomSpy).toHaveBeenCalledWith('test-session');
        expect(broadcastSpy).toHaveBeenCalledWith('test-event', {data: true});
        done = true;
      });
      waitsFor(function() { return done === true; }, 1000);
    });
  });
});
