'use strict';

var SessionManager = function(client) {
  var self = this;

  this.allowNewCards = false;
  this.allowVoting = false;

  this.on = function() {
    self.load();
  };

  this.load = function() {
    return $.get('/session/' + client.sessionId + '/state').then(self.sessionStateChanged);
  };

  this.socketBind = function() {
    client.socket.on('sessionState.changed', self.sessionStateChanged);
  };

  this.sessionStateChanged = function(state) {
    self.allowNewCards = state.allowNewCards;
    self.allowVoting = state.allowVoting;

    client.addCard.sessionStateChanged(state);
    client.voting.sessionStateChanged(state);
  };
};

module.exports = SessionManager;
