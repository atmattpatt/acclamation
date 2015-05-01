'use strict';

var CardVote = require('./cardVote');
var redis = require('../redisClient');
var uuid = require('uuid');

module.exports = function(options) {
  var self = this;

  options = options || {};

  this.id = null;
  this.type = options.type || 'card';
  this.topic = options.topic;
  this.title = options.title;
  this.parent = options.parent;
  this.votes = 0;
  this.author = options.author;

  this.load = function(id, done) {
    redis.hget('cards', id, function(err, res) {
      if (err !== null) {
        throw err;
      }

      self.fromJson(res);
      self.loadVotes(function() {
        done(self);
      });
    });
  };

  this.isValid = function() {
    if (this.topic === undefined || this.topic === '') {
      return false;
    }
    if (this.title === undefined || this.title === '') {
      return false;
    }
    return true;
  };

  this.save = function(done) {
    if (this.id === null) {
      this.id = uuid.v4();
    }

    redis.hset('cards', this.id, this.toJson(), function(err, res) {
      if (err !== null) {
        throw err;
      }

      done(self);
    });
  };

  this.fromJson = function(json) {
    var object = JSON.parse(json);

    for (var key in object) {
      if (object.hasOwnProperty(key) && self.hasOwnProperty(key)) {
        self[key] = object[key];
      }
    }

    return self;
  };

  this.toPlainObject = function() {
    return {
      id: this.id,
      type: this.type,
      topic: this.topic,
      title: this.title,
      author: this.author,
      parent: this.parent,
      votes: this.votes
    };
  };

  this.toJson = function() {
    return JSON.stringify(this.toPlainObject());
  };

  this.loadVotes = function(done) {
    (new CardVote()).load(this.id, function(cardVotes) {
      self.votes = cardVotes.votes;
      if (typeof done === 'function') {
        done();
      }
    });
  };
};
