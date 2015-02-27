/* global io:false */
'use strict';

var CardWall = require('./cardWall');
var Clock = require('./clock');
var Menu = require('./menu');
var Temperature = require('./temperature');

var Moderator = function() {
  var self = this;

  this.socket = io.connect();
  this.cardWall = new CardWall(this);
  this.clock = new Clock(this);
  this.menu = new Menu(this);
  this.temperature = new Temperature(this);

  this.initialize = function() {
    self.sessionId = self.detectSessionId();
    self.socket.emit('ready');
    self.cardWall.initialize();
    self.menu.initialize();
    self.temperature.initialize();
  };

  this.detectSessionId = function() {
    var matches = window.location.pathname.match(/\/moderator\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
    if (matches === null) {
      return null;
    } else {
      return matches[1];
    }
  };

  this.initialize();
};

module.exports = Moderator;
