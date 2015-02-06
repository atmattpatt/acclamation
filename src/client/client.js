/* global io:false */
'use strict';

var AddCard = require('./addCard');
var Author = require('./author');
var CardForm = require('./cardForm');
var CardWall = require('./cardWall');
var SessionManager = require('./sessionManager');
var Temperature = require('./temperature');
var Voting = require('./voting');

var Client = function() {
  var self = this;

  this.sessionId = self.detectSessionId();
  this.socket = io.connect();
  this.temperature = new Temperature(this);
  this.author = new Author(this);
  this.cardWall = new CardWall(this);
  this.addCard = new AddCard(this);
  this.cardForm = new CardForm(this);
  this.voting = new Voting(this);
  this.sessionManager = new SessionManager(this);

  this.initialize = function() {
    var next = self.showTemperature;

    if (self.temperature.hasVoted()) {
      next = self.showAuthor;
    }

    if (self.author.hasProvided()) {
      next = self.initSession;
    }

    self.cardWall.socketBind();
    self.sessionManager.socketBind();

    $(function() {
      setTimeout(next, 500);
    });
  };

  this.showTemperature = function() {
    $('#loader').hide();
    self.temperature.on();
    self.author.off();
    self.addCard.off();
    self.cardWall.off();
    self.cardForm.off();
    self.voting.off();
  };

  this.showAuthor = function() {
    $('#loader').hide();
    self.temperature.off();
    self.author.on();
    self.addCard.off();
    self.cardWall.off();
    self.cardForm.off();
    self.voting.off();
  };

  this.initSession = function() {
    self.sessionManager.on();
  };

  this.showCardWall = function() {
    $('#loader').hide();
    self.temperature.off();
    self.author.off();
    self.cardWall.on();

    if (self.sessionManager.allowVoting && !self.sessionManager.allowNewCards) {
      self.voting.on();
      self.addCard.off();
      self.cardForm.off();
    } else {
      self.addCard.on();
      self.voting.off();
    }
  };

  this.showCardForm = function() {
    self.addCard.off();
    self.cardForm.on();
  };

  this.hideCardForm = function() {
    self.addCard.on();
    self.cardForm.off();
  };

  this.detectSessionId = function() {
    var matches = window.location.pathname.match(/\/client\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}[a-f0-9]{4}-[a-f0-9]{12})/i);
    if (matches === null) {
      return null;
    } else {
      return matches[1];
    }
  };

  this.initialize();
};

module.exports = Client;
