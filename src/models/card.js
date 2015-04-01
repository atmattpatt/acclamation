'use strict';

var Card = function(options) {
  options = options || {};

  this.id = options.id;
  this.type = options.type || 'card';
  this.topic = options.topic;
  this.title = options.title;
  this.parent = options.parent;
  this.votes = 0;
  this.author = options.author;
};

module.exports = Card;
